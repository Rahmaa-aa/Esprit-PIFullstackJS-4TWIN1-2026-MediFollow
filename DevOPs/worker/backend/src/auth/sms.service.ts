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

  /**
   * Send an emergency SOS SMS when a patient logs critically dangerous vitals.
   * Uses TEST_SOS_PHONE_NUMBER from .env for Twilio free-tier testing.
   */
  async sendSOSAlert(
    patientName: string,
    doctorName: string,
    vitals: Record<string, any>,
    location?: { lat: number; lng: number },
  ) {
    const from = process.env.TWILIO_PHONE_NUMBER;
    const to = process.env.TEST_SOS_PHONE_NUMBER;

    if (!to) {
      console.log('[SMS-SOS] TEST_SOS_PHONE_NUMBER not set in .env — skipping SOS SMS.');
      return;
    }

    const mapLink = location
      ? `https://maps.google.com/?q=${location.lat},${location.lng}`
      : null;

    const locationLine = mapLink
      ? `📍 Location: ${mapLink}`
      : '📍 Location: Not available (GPS off)';

    // Build vital state summary
    const vitalLines: string[] = [];
    if (vitals.heartRate != null) vitalLines.push(`❤️ Heart Rate: ${vitals.heartRate} bpm`);
    if (vitals.bloodPressureSystolic != null)
      vitalLines.push(`🩸 BP: ${vitals.bloodPressureSystolic}/${vitals.bloodPressureDiastolic || '—'} mmHg`);
    if (vitals.oxygenSaturation != null) vitalLines.push(`🫁 SpO2: ${vitals.oxygenSaturation}%`);
    if (vitals.temperature != null) vitalLines.push(`🌡️ Temp: ${vitals.temperature}°C`);
    if (vitals.respiratoryRate != null) vitalLines.push(`💨 Resp: ${vitals.respiratoryRate}/min`);

    const body = [
      `🚨 MEDIFOLLOW SOS ALERT 🚨`,
      ``,
      `Dr. ${doctorName}, your patient "${patientName}" just logged critically dangerous vitals!`,
      ``,
      `--- Vital Signs ---`,
      ...vitalLines,
      ``,
      locationLine,
      ``,
      `⚠️ Immediate attention required.`,
    ].join('\n');

    if (this.client && from) {
      try {
        const msg = await this.client.messages.create({
          body: body.substring(0, 1600),
          to,
          from,
        });
        console.log('[SMS-SOS] SOS alert sent! SID:', msg.sid);
      } catch (e) {
        console.error('[SMS-SOS] Failed to send SOS alert:', e?.message || e);
      }
    } else {
      console.log('[SMS-SOS] Twilio not configured. Simulated SOS SMS for', to);
      console.log('[SMS-SOS] Body:', body);
    }
  }
}
