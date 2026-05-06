import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('doctors')
export class DoctorController {
  constructor(private doctorService: DoctorService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: any) {
    return this.doctorService.create(body);
  }

  @Get()
  async findAll() {
    return this.doctorService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Query('stats') stats?: string) {
    if (stats === '1' || stats === 'true') {
      return this.doctorService.findByIdWithStats(id);
    }
    return this.doctorService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.doctorService.update(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.doctorService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/toggle-active')
  async toggleActive(@Param('id') id: string) {
    return this.doctorService.toggleActive(id);
  }
}
