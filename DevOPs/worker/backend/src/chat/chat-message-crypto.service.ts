import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

/** Préfixe pour distinguer les champs chiffrés des anciens en clair en base. */
const ENC_PREFIX = 'enc:v1:';

/**
 * Chiffrement au repos des contenus messagerie (AES-256-GCM).
 * Un hash seul (SHA-256) serait irréversible et interdirait l’affichage des messages.
 */
@Injectable()
export class ChatMessageCryptoService {
  private readonly logger = new Logger(ChatMessageCryptoService.name);
  private readonly key: Buffer | null;

  constructor(private readonly config: ConfigService) {
    const raw = this.config.get<string>('MESSAGE_ENCRYPTION_KEY') ?? process.env.MESSAGE_ENCRYPTION_KEY;
    this.key = this.resolveKey(raw);
    if (!this.key) {
      this.logger.warn(
        'MESSAGE_ENCRYPTION_KEY non défini : les messages sont stockés en clair. Définissez une clé en production.',
      );
    }
  }

  /** Clé 32 octets : hex 64 caractères, base64 32 octets décodés, ou phrase dérivée (scrypt). */
  private resolveKey(raw: string | undefined): Buffer | null {
    if (!raw || !String(raw).trim()) return null;
    const s = String(raw).trim();
    if (/^[0-9a-fA-F]{64}$/.test(s)) {
      return Buffer.from(s, 'hex');
    }
    try {
      const b = Buffer.from(s, 'base64');
      if (b.length === 32) return b;
    } catch {
      /* ignore */
    }
    return scryptSync(s, 'medifollow-chat-msg-v1', 32);
  }

  isEnabled(): boolean {
    return this.key !== null;
  }

  /** Chiffre une chaîne pour stockage MongoDB ; chaîne vide inchangée. */
  encryptField(plain: string): string {
    if (!this.key || plain === '') return plain;
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    const out = Buffer.concat([iv, tag, enc]);
    return ENC_PREFIX + out.toString('base64');
  }

  /** Déchiffre si préfixe présent ; sinon renvoie la valeur (rétrocompatibilité). */
  decryptField(stored: string): string {
    if (!stored || !this.key) return stored;
    if (!stored.startsWith(ENC_PREFIX)) return stored;
    try {
      const buf = Buffer.from(stored.slice(ENC_PREFIX.length), 'base64');
      const iv = buf.subarray(0, 12);
      const tag = buf.subarray(12, 28);
      const ciphertext = buf.subarray(28);
      const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
      decipher.setAuthTag(tag);
      return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
    } catch (e) {
      this.logger.warn(`Déchiffrement impossible (${(e as Error).message}) — valeur renvoyée telle quelle.`);
      return stored;
    }
  }
}
