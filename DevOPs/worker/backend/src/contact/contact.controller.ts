import { Body, Controller, Post, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { EmailService } from '../auth/email.service';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Controller('contact')
export class ContactController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  async post(@Body() body: Record<string, unknown>) {
    const name = String(body?.name ?? '').trim();
    const email = String(body?.email ?? '').trim();
    const subject = String(body?.subject ?? '').trim();
    const message = String(body?.message ?? '').trim();

    if (name.length < 2 || name.length > 200) {
      throw new BadRequestException('Nom invalide (2–200 caractères).');
    }
    if (!EMAIL_RE.test(email) || email.length > 254) {
      throw new BadRequestException('Adresse e-mail invalide.');
    }
    if (subject.length < 1 || subject.length > 200) {
      throw new BadRequestException('Objet invalide (1–200 caractères).');
    }
    if (message.length < 3 || message.length > 10000) {
      throw new BadRequestException('Message invalide (3–10 000 caractères).');
    }

    try {
      await this.emailService.sendContactInquiry({ name, email, subject, message });
    } catch (e: unknown) {
      const code = e && typeof e === 'object' && 'code' in e ? String((e as { code?: string }).code) : '';
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message?: string }).message) : '';
      if (code === 'SMTP_NOT_CONFIGURED' || msg === 'SMTP_NOT_CONFIGURED') {
        throw new ServiceUnavailableException(
          'Envoi e-mail indisponible : SMTP non configuré sur le serveur.',
        );
      }
      if (code === 'CONTACT_DESTINATION_NOT_CONFIGURED' || msg === 'CONTACT_DESTINATION_NOT_CONFIGURED') {
        throw new ServiceUnavailableException(
          'Destination du formulaire de contact non configurée (CONTACT_FORM_TO ou SMTP_USER).',
        );
      }
      throw e;
    }

    return { ok: true };
  }
}
