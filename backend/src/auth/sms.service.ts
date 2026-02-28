import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsService {
  private client: any = null;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (accountSid && authToken) {
      try {
        const twilio = require('twilio');
        this.client = twilio(accountSid, authToken);
      } catch (e) {
        console.warn('[SMS] Twilio non installé ou erreur:', e?.message || e);
      }
    }
  }

  private toE164(phone: string): string {
    if (!phone || typeof phone !== 'string') return '';
    let cleaned = phone.replace(/\s+/g, '').trim();
    if (cleaned.startsWith('+')) return cleaned;
    if (cleaned.startsWith('00')) return '+' + cleaned.slice(2);
    if (cleaned.startsWith('0')) return '+33' + cleaned.slice(1);
    return cleaned;
  }

  async sendPatientCredentials(
    phone: string,
    password: string,
    firstName: string,
    lastName: string,
    email: string,
    address: string,
  ) {
    const from = process.env.TWILIO_PHONE_NUMBER;
    const to = this.toE164(phone);

    if (!to) {
      console.log('[SMS] Numéro de téléphone invalide, SMS non envoyé');
      return;
    }

    const addressShort = address ? (address.length > 40 ? `${address.substring(0, 40)}...` : address) : '—';
    const baseUrl = process.env.FRONTEND_URL || 'MediFollow';
    const body = `MediFollow: Bonjour ${firstName} ${lastName}. Compte créé. Email: ${email} | Adresse: ${addressShort} | MDP: ${password}. ${baseUrl}`;

    if (this.client && from) {
      try {
        await this.client.messages.create({
          body: body.substring(0, 1600),
          to,
          from,
        });
      } catch (e) {
        console.error('[SMS] Erreur envoi:', e?.message || e);
      }
    } else {
      console.log('[SMS] Twilio non configuré. SMS simulé pour', to, '| Mot de passe:', password);
    }
  }
}
