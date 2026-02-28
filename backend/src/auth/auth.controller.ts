import { Controller, Post, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('confirm-login')
  async confirmLogin(@Body() body: { token: string }) {
    return this.authService.confirmLogin(body.token);
  }

  @Post('doctor-login')
  async doctorLogin(@Body() body: { email: string; password: string }) {
    return this.authService.loginDoctor(body.email, body.password);
  }

  @Post('patient-login')
  async patientLogin(@Body() body: { email: string; password: string }) {
    return this.authService.loginPatient(body.email, body.password);
  }

  @Post('nurse-login')
  async nurseLogin(@Body() body: { email: string; password: string }) {
    return this.authService.loginNurse(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Request() req: any) {
    return { user: req.user };
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateMe(
    @Request() req: any,
    @Body()
    body: {
      name?: string;
      email?: string;
      password?: string;
      profileImage?: string;
      alternateEmail?: string;
      languages?: string[];
      socialMedia?: { facebook?: string; twitter?: string; google?: string; instagram?: string; youtube?: string };
    },
  ) {
    return this.authService.updateProfile(req.user.id, body);
  }

  @Post('seed-admin')
  async seedAdmin(@Body() body: { email?: string; password?: string }) {
    const email = body.email || 'admin@medifollow.com';
    const password = body.password || 'Admin123!';
    return this.authService.createAdmin(email, password);
  }
}
