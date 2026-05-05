import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Get('ping')
  ping() {
    return { status: 'ok', message: 'Chatbot controller is reachable' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('ask')
  async ask(@Body() body: { messages: any[]; lang: string }) {
    const { messages, lang } = body;
    return this.chatbotService.ask(messages, lang);
  }
}
