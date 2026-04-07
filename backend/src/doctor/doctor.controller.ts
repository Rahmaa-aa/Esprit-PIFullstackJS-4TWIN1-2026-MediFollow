import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@Controller('doctors')
export class DoctorController {
  constructor(private doctorService: DoctorService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: { user?: { role?: string; id?: unknown; department?: string } }, @Body() body: any) {
    return this.doctorService.create(body, req.user);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async findAll(@Req() req: { user?: { role?: string; id?: unknown; department?: string } }) {
    return this.doctorService.findAll(req.user);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: { user?: { role?: string; id?: unknown; department?: string } }) {
    return this.doctorService.findById(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Req() req: { user?: { role?: string; id?: unknown; department?: string } },
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.doctorService.update(id, body, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Req() req: { user?: { role?: string; id?: unknown; department?: string } }, @Param('id') id: string) {
    return this.doctorService.delete(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/toggle-active')
  async toggleActive(@Req() req: { user?: { role?: string; id?: unknown; department?: string } }, @Param('id') id: string) {
    return this.doctorService.toggleActive(id, req.user);
  }
}
