import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
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

  constructor(private httpService: HttpService) {
    this.n8nBaseUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
    this.n8nApiKey = process.env.N8N_API_KEY || '';
  }

  public async triggerWorkflow(workflowId: string, data: any): Promise<N8nWebhookResponse> {
    try {
      const response = await this.httpService.post(
        `${this.n8nBaseUrl}/api/v1/workflows/${workflowId}/activate`,
        {},
        {
          headers: {
            'X-N8N-API-KEY': this.n8nApiKey,
            'Content-Type': 'application/json',
          },
        },
      ).toPromise();

      return {
        success: true,
        workflowId,
        executionId: response?.data?.data?.executionId,
        message: 'Workflow triggered successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to trigger n8n workflow ${workflowId}:`, error);
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
      await this.httpService.get(
        `${this.n8nBaseUrl}/api/v1/workflows`,
        {
          headers: {
            'X-N8N-API-KEY': this.n8nApiKey,
          },
        },
      ).toPromise();

      this.logger.log('n8n connection test successful');
      return true;
    } catch (error) {
      this.logger.error('n8n connection test failed:', error);
      return false;
    }
  }
}
