import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @UseGuards(JwtAuthGuard)
  @Get('my-stats')
  async getMyStats(@Req() req: any) {
    const userId = req.user.id || req.user.userId || req.user._id;
    const role = req.user.role;
    return this.gamificationService.getStats(userId, role);
  }

  @UseGuards(JwtAuthGuard)
  @Post('award-points')
  async awardPoints(@Req() req: any, @Body() body: { action: any }) {
    const userId = req.user.id || req.user.userId || req.user._id;
    const role = req.user.role;
    const { action } = body;
    // For security, only some actions can be triggered by the frontend manually if needed.
    // Most should be triggered automatically by backend hooks.
    return this.gamificationService.awardPoints(userId, role, action);
  }
}
