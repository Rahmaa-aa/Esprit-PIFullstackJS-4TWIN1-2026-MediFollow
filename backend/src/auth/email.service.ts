import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }
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
        from: process.env.SMTP_FROM || '"MediFollow" <noreply@medifollow.com>',
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
        from: process.env.SMTP_FROM || '"MediFollow" <noreply@medifollow.com>',
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
        from: process.env.SMTP_FROM || '"MediFollow" <noreply@medifollow.com>',
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
        from: process.env.SMTP_FROM || '"MediFollow" <noreply@medifollow.com>',
        to: email,
        subject: 'Votre compte MediFollow - Coordonnées et identifiants',
        html,
      });
    } else {
      console.log('[Patient] Email non configuré. Credentials:', { email, password: '***' });
    }
  }
}
