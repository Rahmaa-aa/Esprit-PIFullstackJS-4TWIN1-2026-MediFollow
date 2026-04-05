import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      const hostLc = host.toLowerCase();
      const isGmail = hostLc.includes('gmail') || hostLc.includes('googlemail');
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        requireTLS: port !== 465,
        auth: { user, pass },
      });
      if (isGmail) {
        const fromEmail = this.extractEmailFromFromHeader(process.env.SMTP_FROM || '');
        if (fromEmail && fromEmail.toLowerCase() !== user.toLowerCase()) {
          this.logger.warn(
            `SMTP_FROM (${fromEmail}) ne correspond pas à SMTP_USER (${user}). Gmail n’accepte en général que l’identité du compte connecté — utilisation de From: "${this.getSmtpFrom()}".`,
          );
        }
      }
    } else {
      this.logger.warn(
        'SMTP incomplet (SMTP_HOST / SMTP_USER / SMTP_PASS) — aucun envoi e-mail (MFA, copie messagerie, etc.).',
      );
    }
  }

  /** Adresse e-mail extraite de SMTP_FROM (ex. "Nom <a@b.com>" ou "a@b.com"). */
  private extractEmailFromFromHeader(raw: string): string | null {
    const m = String(raw || '').match(/<([^>]+@[^>]+)>/);
    if (m) return m[1].trim().toLowerCase();
    const t = String(raw || '').trim();
    if (/^\S+@\S+\.\S+$/.test(t)) return t.toLowerCase();
    return null;
  }

  /**
   * Gmail (et la plupart des relais) exigent que l’en-tête From corresponde au compte SMTP authentifié,
   * sauf alias explicitement configuré chez le fournisseur.
   */
  getSmtpFrom(): string {
    const user = process.env.SMTP_USER || '';
    const rawFrom = process.env.SMTP_FROM || '';
    const host = (process.env.SMTP_HOST || '').toLowerCase();
    const isGmail = host.includes('gmail') || host.includes('googlemail');

    const fromEmail = rawFrom ? this.extractEmailFromFromHeader(rawFrom) : null;
    if (isGmail && user) {
      if (!fromEmail || fromEmail !== user.toLowerCase()) {
        const display = rawFrom
          .replace(/<[^>]*>/g, '')
          .trim()
          .replace(/^["']|["']$/g, '');
        return `${display || 'MediFollow'} <${user}>`;
      }
    }
    return rawFrom || (user ? `"MediFollow" <${user}>` : '"MediFollow" <noreply@medifollow.com>');
  }

  async sendLoginConfirmation(email: string, token: string, userName: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const confirmUrl = `${frontendUrl}/auth/confirm-login?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #089bab;">MediFollow Login Confirmation</h2>
        <p>Hello ${userName || 'Admin'},</p>
        <p>A login attempt to your MediFollow admin account has been made.</p>
        <p>Click the link below to confirm and access your session:</p>
        <p style="margin: 25px 0;">
          <a href="${confirmUrl}" style="background: #089bab; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Confirm my login
          </a>
        </p>
        <p style="color: #666; font-size: 12px;">This link expires in 15 minutes. If you did not make this request, please ignore this email.</p>
        <p style="color: #666; font-size: 12px;">Direct link: <a href="${confirmUrl}">${confirmUrl}</a></p>
      </div>
    `;

    if (this.transporter) {
      await this.transporter.sendMail({
        from: this.getSmtpFrom(),
        to: email,
        subject: 'Confirm your login - MediFollow',
        html,
      });
    } else {
      console.log('[MFA] Email non configuré. Lien de confirmation:', confirmUrl);
    }
  }

  generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async sendDoctorCredentials(email: string, password: string, firstName: string, lastName: string) {
    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const signInUrl = `${loginUrl}/auth/sign-in`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #089bab;">Welcome to MediFollow</h2>
        <p>Hello Dr. ${firstName || ''} ${lastName || ''},</p>
        <p>Your MediFollow doctor account has been created. Below are your login credentials to access your session:</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 0;"><strong>Password:</strong> ${password}</p>
        </div>
        <p>Click the button below to sign in to your account:</p>
        <p style="margin: 25px 0;">
          <a href="${signInUrl}" style="background: #089bab; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Sign in to MediFollow
          </a>
        </p>
        <p style="color: #666; font-size: 12px;">For security reasons, we recommend changing your password after your first login.</p>
        <p style="color: #666; font-size: 12px;">Direct link: <a href="${signInUrl}">${signInUrl}</a></p>
      </div>
    `;

    if (this.transporter) {
      await this.transporter.sendMail({
        from: this.getSmtpFrom(),
        to: email,
        subject: 'Your MediFollow Doctor Account - Login Credentials',
        html,
      });
    } else {
      console.log('[Doctor] Email non configuré. Credentials:', { email, password: '***' });
    }
  }

  async sendNurseCredentials(email: string, password: string, firstName: string, lastName: string) {
    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const signInUrl = `${loginUrl}/auth/sign-in`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #089bab;">Bienvenue sur MediFollow</h2>
        <p>Bonjour ${firstName || ''} ${lastName || ''},</p>
        <p>Votre compte infirmier(ère) MediFollow a été créé. Voici vos identifiants de connexion:</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 0;"><strong>Mot de passe:</strong> ${password}</p>
        </div>
        <p>Cliquez sur le bouton ci-dessous pour vous connecter à votre espace (suivi quotidien, saisie des données, alertes):</p>
        <p style="margin: 25px 0;">
          <a href="${signInUrl}" style="background: #089bab; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Accéder à MediFollow
          </a>
        </p>
        <p style="color: #666; font-size: 12px;">Pour des raisons de sécurité, nous vous recommandons de modifier votre mot de passe après votre première connexion.</p>
      </div>
    `;

    if (this.transporter) {
      await this.transporter.sendMail({
        from: this.getSmtpFrom(),
        to: email,
        subject: 'Votre compte MediFollow Infirmier(ère) - Identifiants',
        html,
      });
    } else {
      console.log('[Nurse] Email non configuré. Credentials:', { email, password: '***' });
    }
  }

  async sendPatientCredentials(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string,
    address: string,
    city: string,
    country: string,
  ) {
    const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const patientLoginUrl = `${loginUrl}/auth/sign-in`;

    const addressLine = [address, city, country].filter(Boolean).join(', ') || '—';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #089bab;">Bienvenue sur MediFollow</h2>
        <p>Bonjour ${firstName || ''} ${lastName || ''},</p>
        <p>Votre compte patient MediFollow a été créé. Voici vos coordonnées et identifiants de connexion :</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Email :</strong> ${email}</p>
          <p style="margin: 0 0 8px 0;"><strong>Téléphone :</strong> ${phone || '—'}</p>
          <p style="margin: 0 0 8px 0;"><strong>Adresse :</strong> ${addressLine}</p>
          <p style="margin: 0;"><strong>Mot de passe :</strong> ${password}</p>
        </div>
        <p>Cliquez sur le bouton ci-dessous pour vous connecter à votre espace patient :</p>
        <p style="margin: 25px 0;">
          <a href="${patientLoginUrl}" style="background: #089bab; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Accéder à MediFollow
          </a>
        </p>
        <p style="color: #666; font-size: 12px;">Pour des raisons de sécurité, nous vous recommandons de modifier votre mot de passe après votre première connexion.</p>
      </div>
    `;

    if (this.transporter) {
      await this.transporter.sendMail({
        from: this.getSmtpFrom(),
        to: email,
        subject: 'Votre compte MediFollow - Coordonnées et identifiants',
        html,
      });
    } else {
      console.log('[Patient] Email non configuré. Credentials:', { email, password: '***' });
    }
  }

  /**
   * Copie du message interne MediFollow vers la boîte mail du destinataire (Gmail, Outlook, etc.).
   * Nécessite SMTP (ex. smtp.gmail.com + mot de passe d’application Google).
   */
  async sendInternalMailMirror(params: {
    toEmail: string;
    subject: string;
    bodyPlain: string;
    fromDisplay: string;
  }): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('[Mirror] SMTP non configuré — copie messagerie interne ignorée.');
      return;
    }
    const esc = (s: string) =>
      String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    const subj = esc(params.subject).slice(0, 200);
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
        <p style="color:#666;font-size:12px;">MediFollow — copie de message interne</p>
        <p><strong>De :</strong> ${esc(params.fromDisplay)}</p>
        <p><strong>Objet :</strong> ${subj}</p>
        <hr style="border:none;border-top:1px solid #ddd;"/>
        <div style="white-space:pre-wrap;">${esc(params.bodyPlain)}</div>
        <hr style="border:none;border-top:1px solid #ddd;"/>
        <p style="color:#888;font-size:12px;">Vous recevez cette copie sur votre adresse e-mail pour consultation immédiate (ex. Gmail).
        Pour répondre, privilégiez la messagerie MediFollow lorsque c’est possible.</p>
      </div>
    `;
    const subjectLine = `[MediFollow] ${params.subject}`.slice(0, 998);
    const from = this.getSmtpFrom();
    const info = await this.transporter.sendMail({
      from,
      to: params.toEmail,
      subject: subjectLine,
      html,
    });
    this.logger.log(
      `[Mirror] Copie envoyée vers ${params.toEmail} (messageId SMTP: ${info.messageId || 'n/a'})`,
    );
  }
}
