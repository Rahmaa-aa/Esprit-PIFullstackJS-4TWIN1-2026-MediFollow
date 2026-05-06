import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Appointment } from '../appointment/schemas/appointment.schema';

export interface N8nWorkflowTrigger {
  eventName: string;
  appointment: Appointment;
  timestamp: Date;
  metadata?: any;
}

export interface N8nWebhookResponse {
  success: boolean;
  workflowId?: string;
  executionId?: string;
  message?: string;
}

@Injectable()
export class N8nService {
  private readonly logger = new Logger(N8nService.name);
  private readonly n8nBaseUrl: string;
  private readonly n8nApiKey: string;

  /** Maps our logical workflow id to the Webhook node path segment (see `src/n8n/workflows/*.json`). */
  private static readonly WEBHOOK_PATH_BY_WORKFLOW: Record<string, string> = {
    'appointment-confirmation': 'appointment-confirmation',
    'appointment-email-confirmation': 'appointment-confirmed',
    'appointment-reminder': 'appointment-reminder',
    'appointment-cancellation': 'appointment-cancelled',
    'appointment-followup': 'appointment-followup',
    'doctor-notification': 'doctor-notification',
    'admin-notification': 'admin-notification',
  };

  constructor(private httpService: HttpService) {
    this.n8nBaseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
    this.n8nApiKey = process.env.N8N_API_KEY || '';
  }

  /**
   * Triggers an n8n workflow by POSTing JSON to its Webhook URL.
   * The workflow must be active in n8n; path must match the Webhook node's path.
   */
  public async triggerWorkflow(workflowId: string, data: any): Promise<N8nWebhookResponse> {
    const pathSegment =
      N8nService.WEBHOOK_PATH_BY_WORKFLOW[workflowId] ?? workflowId.replace(/^\/+|\/+$/g, '');
    const base = this.n8nBaseUrl.replace(/\/$/, '');
    const url = `${base}/webhook/${pathSegment}`;
    const payload = data ?? {};

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            'Content-Type': 'application/json',
            ...(this.n8nApiKey ? { 'X-N8N-API-KEY': this.n8nApiKey } : {}),
          },
        }),
      );

      const body = response?.data as any;
      const executionId =
        body?.executionId ??
        body?.data?.executionId ??
        body?.data?.data?.executionId ??
        body?.execution?.id;

      return {
        success: true,
        workflowId,
        executionId,
        message: 'Workflow triggered successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to trigger n8n workflow ${workflowId} at ${url}:`, error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async triggerAppointmentCreated(appointment: Appointment): Promise<N8nWebhookResponse> {
    const triggerData: N8nWorkflowTrigger = {
      eventName: 'appointment.created',
      appointment,
      timestamp: new Date(),
    };

    return this.triggerWorkflow('appointment-confirmation', triggerData);
  }

  async triggerAppointmentApproved(appointment: Appointment): Promise<N8nWebhookResponse> {
    const triggerData: N8nWorkflowTrigger = {
      eventName: 'appointment.approved',
      appointment,
      timestamp: new Date(),
    };

    return this.triggerWorkflow('appointment-email-confirmation', triggerData);
  }

  async triggerAppointmentReminder(appointment: Appointment, hoursBefore: number = 24): Promise<N8nWebhookResponse> {
    const triggerData: N8nWorkflowTrigger = {
      eventName: 'appointment.reminder',
      appointment,
      timestamp: new Date(),
      metadata: { hoursBefore },
    };

    return this.triggerWorkflow('appointment-reminder', triggerData);
  }

  async triggerAppointmentCancelled(appointment: Appointment): Promise<N8nWebhookResponse> {
    const triggerData: N8nWorkflowTrigger = {
      eventName: 'appointment.cancelled',
      appointment,
      timestamp: new Date(),
    };

    return this.triggerWorkflow('appointment-cancellation', triggerData);
  }

  async triggerAppointmentCompleted(appointment: Appointment): Promise<N8nWebhookResponse> {
    const triggerData: N8nWorkflowTrigger = {
      eventName: 'appointment.completed',
      appointment,
      timestamp: new Date(),
    };

    return this.triggerWorkflow('appointment-followup', triggerData);
  }

  async triggerDoctorNotified(appointment: Appointment): Promise<N8nWebhookResponse> {
    const triggerData: N8nWorkflowTrigger = {
      eventName: 'doctor.notified',
      appointment,
      timestamp: new Date(),
    };

    return this.triggerWorkflow('doctor-notification', triggerData);
  }

  async triggerAdminNotified(appointment: Appointment): Promise<N8nWebhookResponse> {
    const triggerData: N8nWorkflowTrigger = {
      eventName: 'admin.notified',
      appointment,
      timestamp: new Date(),
    };

    return this.triggerWorkflow('admin-notification', triggerData);
  }

  async testConnection(): Promise<boolean> {
    try {
      await firstValueFrom(
        this.httpService.get(`${this.n8nBaseUrl}/api/v1/workflows`, {
          headers: {
            'X-N8N-API-KEY': this.n8nApiKey,
          },
        }),
      );

      this.logger.log('n8n connection test successful');
      return true;
    } catch (error) {
      this.logger.error('n8n connection test failed:', error);
      return false;
    }
  }
}
