import { Controller, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { N8nService } from './n8n.service';

@Controller('n8n')
export class N8nController {
  constructor(private n8nService: N8nService) {}

  @Post('test-connection')
  async testConnection() {
    const isConnected = await this.n8nService.testConnection();
    return {
      success: isConnected,
      message: isConnected ? 'n8n connection successful' : 'n8n connection failed',
      timestamp: new Date(),
    };
  }

  @Post('trigger-workflow')
  async triggerWorkflow(@Body() body: { workflowId: string; data: any }) {
    const result = await this.n8nService.triggerWorkflow(body.workflowId, body.data);
    return {
      ...result,
      timestamp: new Date(),
    };
  }

  @Get('status')
  async getStatus() {
    const isConnected = await this.n8nService.testConnection();
    return {
      n8nConnected: isConnected,
      service: 'MediFollow n8n Integration',
      version: '1.0.0',
      timestamp: new Date(),
    };
  }
}
