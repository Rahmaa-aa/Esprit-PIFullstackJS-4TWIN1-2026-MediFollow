import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { N8nService } from './n8n.service';
import { N8nController } from './n8n.controller';
import { Appointment } from '../appointment/schemas/appointment.schema';
import { Types } from 'mongoose';

describe('Patient Appointment n8n Integration', () => {
  let n8nService: N8nService;
  let n8nController: N8nController;
  let httpService: HttpService;

  const mockAppointment: Partial<Appointment> = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    patientId: new Types.ObjectId('507f1f77bcf86cd799439012'),
    doctorId: '507f1f77bcf86cd799439013',
    doctorName: 'Dr. Smith',
    title: 'Regular checkup',
    date: '2026-05-10',
    time: '10:00',
    status: 'pending',
    location: 'Main Clinic',
    type: 'checkup',
    requestedDate: '2026-05-10',
    requestedTime: '10:00',
    patientMessage: 'Need regular checkup'
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [N8nController],
      providers: [
        N8nService,
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    n8nService = module.get<N8nService>(N8nService);
    n8nController = module.get<N8nController>(N8nController);
    httpService = module.get<HttpService>(HttpService);
  });

  describe('Patient Appointment Request Workflow', () => {
    it('should trigger n8n workflow when patient requests appointment', async () => {
      // Mock successful n8n API response
      const mockN8nResponse = {
        data: {
          data: {
            executionId: 'exec-123456'
          }
        }
      };

      (httpService.post as jest.Mock).mockReturnValue(of(mockN8nResponse));

      // Simulate patient requesting appointment
      const result = await n8nService.triggerAppointmentCreated(mockAppointment as Appointment);

      // Verify n8n was called with correct parameters
      expect(httpService.post).toHaveBeenCalledWith(
        expect.stringMatching(/\/webhook\/appointment-confirmation$/),
        expect.objectContaining({
          eventName: 'appointment.created',
          appointment: mockAppointment,
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );

      // Verify response
      expect(result).toEqual({
        success: true,
        workflowId: 'appointment-confirmation',
        executionId: 'exec-123456',
        message: 'Workflow triggered successfully',
      });
    });

    it('should trigger notification workflow when appointment is approved', async () => {
      const approvedAppointment = { ...mockAppointment, status: 'approved' } as Appointment;
      const mockN8nResponse = {
        data: {
          data: {
            executionId: 'exec-789012'
          }
        }
      };

      (httpService.post as jest.Mock).mockReturnValue(of(mockN8nResponse));

      const result = await n8nService.triggerAppointmentApproved(approvedAppointment);

      expect(httpService.post).toHaveBeenCalledWith(
        expect.stringMatching(/\/webhook\/appointment-confirmed$/),
        expect.objectContaining({
          eventName: 'appointment.approved',
          appointment: approvedAppointment,
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );

      expect(result).toEqual({
        success: true,
        workflowId: 'appointment-email-confirmation',
        executionId: 'exec-789012',
        message: 'Workflow triggered successfully',
      });
    });

    it('should trigger reminder workflow 24 hours before appointment', async () => {
      const mockN8nResponse = {
        data: {
          data: {
            executionId: 'exec-345678'
          }
        }
      };

      (httpService.post as jest.Mock).mockReturnValue(of(mockN8nResponse));

      const result = await n8nService.triggerAppointmentReminder(mockAppointment as Appointment, 24);

      expect(httpService.post).toHaveBeenCalledWith(
        expect.stringMatching(/\/webhook\/appointment-reminder$/),
        expect.objectContaining({
          eventName: 'appointment.reminder',
          metadata: { hoursBefore: 24 },
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );

      expect(result).toEqual({
        success: true,
        workflowId: 'appointment-reminder',
        executionId: 'exec-345678',
        message: 'Workflow triggered successfully',
      });
    });

    it('should handle n8n API failure gracefully', async () => {
      const errorMessage = 'n8n service unavailable';
      (httpService.post as jest.Mock).mockReturnValue(throwError(() => new Error(errorMessage)));

      const result = await n8nService.triggerAppointmentCreated(mockAppointment as Appointment);

      expect(result).toEqual({
        success: false,
        message: errorMessage,
      });
    });

    it('should test n8n connection before triggering workflows', async () => {
      // Mock successful connection test
      (httpService.get as jest.Mock).mockReturnValue(of({ data: { workflows: [] } }));

      const connectionResult = await n8nService.testConnection();
      expect(connectionResult).toBe(true);

      expect(httpService.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/workflows'),
        {
          headers: {
            'X-N8N-API-KEY': expect.any(String),
          },
        }
      );
    });

    it('should return appropriate controller response for workflow trigger', async () => {
      const mockN8nResponse = {
        success: true,
        workflowId: 'appointment-confirmation',
        executionId: 'exec-123456',
        message: 'Workflow triggered successfully',
      };

      jest.spyOn(n8nService, 'triggerWorkflow').mockResolvedValue(mockN8nResponse);

      const controllerResult = await n8nController.triggerWorkflow({
        workflowId: 'appointment-confirmation',
        data: { appointment: mockAppointment }
      });

      expect(controllerResult).toEqual({
        ...mockN8nResponse,
        timestamp: expect.any(Date),
      });
    });
  });

  describe('Complete Patient Journey Simulation', () => {
    it('should simulate complete patient appointment workflow', async () => {
      const mockResponses = [
        { data: { data: { executionId: 'exec-001' } } }, // appointment created
        { data: { data: { executionId: 'exec-002' } } }, // appointment approved
        { data: { data: { executionId: 'exec-003' } } }, // doctor notified
        { data: { data: { executionId: 'exec-004' } } }, // admin notified
        { data: { data: { executionId: 'exec-005' } } }, // reminder sent
      ];

      (httpService.post as jest.Mock).mockReturnValueOnce(of(mockResponses[0]));
      (httpService.post as jest.Mock).mockReturnValueOnce(of(mockResponses[1]));
      (httpService.post as jest.Mock).mockReturnValueOnce(of(mockResponses[2]));
      (httpService.post as jest.Mock).mockReturnValueOnce(of(mockResponses[3]));
      (httpService.post as jest.Mock).mockReturnValueOnce(of(mockResponses[4]));

      // Step 1: Patient requests appointment
      const createdResult = await n8nService.triggerAppointmentCreated(mockAppointment as Appointment);
      expect(createdResult.success).toBe(true);

      // Step 2: Appointment gets approved
      const approvedAppointment = { ...mockAppointment, status: 'approved' } as Appointment;
      const approvedResult = await n8nService.triggerAppointmentApproved(approvedAppointment);
      expect(approvedResult.success).toBe(true);

      // Step 3: Doctor gets notified
      const doctorNotifiedResult = await n8nService.triggerDoctorNotified(approvedAppointment);
      expect(doctorNotifiedResult.success).toBe(true);

      // Step 4: Admin gets notified
      const adminNotifiedResult = await n8nService.triggerAdminNotified(approvedAppointment);
      expect(adminNotifiedResult.success).toBe(true);

      // Step 5: Reminder sent 24 hours before
      const reminderResult = await n8nService.triggerAppointmentReminder(approvedAppointment, 24);
      expect(reminderResult.success).toBe(true);

      // Verify all API calls were made
      expect(httpService.post).toHaveBeenCalledTimes(5);
    });
  });
});
