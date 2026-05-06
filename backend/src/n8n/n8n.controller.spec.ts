import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { N8nController } from './n8n.controller';
import { N8nService } from './n8n.service';

describe('N8nController', () => {
  let controller: N8nController;
  let n8nService: N8nService;

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

    controller = module.get<N8nController>(N8nController);
    n8nService = module.get<N8nService>(N8nService);
  });

  describe('testConnection', () => {
    it('should return success when n8n is connected', async () => {
      jest.spyOn(n8nService, 'testConnection').mockResolvedValue(true);
      
      const result = await controller.testConnection();
      
      expect(result).toEqual({
        success: true,
        message: 'n8n connection successful',
        timestamp: expect.any(Date),
      });
    });

    it('should return failure when n8n is not connected', async () => {
      jest.spyOn(n8nService, 'testConnection').mockResolvedValue(false);
      
      const result = await controller.testConnection();
      
      expect(result).toEqual({
        success: false,
        message: 'n8n connection failed',
        timestamp: expect.any(Date),
      });
    });
  });

  describe('triggerWorkflow', () => {
    it('should trigger workflow successfully', async () => {
      const mockResponse = {
        success: true,
        workflowId: 'test-workflow',
        executionId: 'test-execution',
        message: 'Workflow triggered successfully',
      };
      
      jest.spyOn(n8nService, 'triggerWorkflow').mockResolvedValue(mockResponse);
      
      const result = await controller.triggerWorkflow({
        workflowId: 'test-workflow',
        data: { test: true },
      });
      
      expect(result).toEqual({
        ...mockResponse,
        timestamp: expect.any(Date),
      });
    });

    it('should handle workflow trigger failure', async () => {
      const mockResponse = {
        success: false,
        message: 'API error',
      };
      
      jest.spyOn(n8nService, 'triggerWorkflow').mockResolvedValue(mockResponse);
      
      const result = await controller.triggerWorkflow({
        workflowId: 'test-workflow',
        data: { test: true },
      });
      
      expect(result).toEqual({
        ...mockResponse,
        timestamp: expect.any(Date),
      });
    });
  });

  describe('getStatus', () => {
    it('should return status when n8n is connected', async () => {
      jest.spyOn(n8nService, 'testConnection').mockResolvedValue(true);
      
      const result = await controller.getStatus();
      
      expect(result).toEqual({
        n8nConnected: true,
        service: 'MediFollow n8n Integration',
        version: '1.0.0',
        timestamp: expect.any(Date),
      });
    });

    it('should return status when n8n is not connected', async () => {
      jest.spyOn(n8nService, 'testConnection').mockResolvedValue(false);
      
      const result = await controller.getStatus();
      
      expect(result).toEqual({
        n8nConnected: false,
        service: 'MediFollow n8n Integration',
        version: '1.0.0',
        timestamp: expect.any(Date),
      });
    });
  });
});
