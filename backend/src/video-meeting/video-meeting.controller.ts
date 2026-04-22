import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { VideoMeetingService } from './video-meeting.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('video-meetings')
@UseGuards(JwtAuthGuard)
export class VideoMeetingController {
  constructor(private readonly service: VideoMeetingService) {}

  private assertDoctorOrAdmin(req: any) {
    const role = req.user?.role;
    if (!['doctor', 'admin', 'superadmin'].includes(role)) {
      throw new ForbiddenException('Access restricted to doctors and administrators');
    }
  }

  @Post()
  async create(@Request() req: any, @Body() body: any) {
    this.assertDoctorOrAdmin(req);
    return this.service.create(body, {
      id: req.user.id,
      name: req.user.name || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(),
      role: req.user.role,
    });
  }

  @Get()
  async myMeetings(@Request() req: any) {
    return this.service.findByUser(req.user.id);
  }

  @Get('invitable-users')
  async invitableUsers(@Request() req: any) {
    this.assertDoctorOrAdmin(req);
    return this.service.getInvitableUsers();
  }

  @Get('all')
  async allMeetings(@Request() req: any) {
    if (!['admin', 'superadmin'].includes(req.user?.role)) {
      throw new ForbiddenException('Admin only');
    }
    return this.service.findAll();
  }

  @Get('code/:code')
  async byCode(@Param('code') code: string) {
    return this.service.findByCode(code);
  }

  @Get(':id')
  async byId(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Put(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    this.assertDoctorOrAdmin(req);
    return this.service.update(id, body, req.user.id);
  }

  @Delete(':id')
  async cancel(@Request() req: any, @Param('id') id: string) {
    return this.service.cancel(id, req.user.id);
  }

  @Post('join/:code')
  async join(@Request() req: any, @Param('code') code: string) {
    return this.service.join(code, {
      id: req.user.id,
      name: req.user.name || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(),
      role: req.user.role,
    });
  }
}
