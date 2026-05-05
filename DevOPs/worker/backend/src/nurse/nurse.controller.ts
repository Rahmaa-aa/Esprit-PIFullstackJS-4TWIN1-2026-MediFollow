import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { NurseService } from './nurse.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('nurses')
export class NurseController {
  constructor(private nurseService: NurseService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: any) {
    return this.nurseService.create(body);
  }

  @Get()
  async findAll() {
    return this.nurseService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.nurseService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.nurseService.update(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.nurseService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/toggle-active')
  async toggleActive(@Param('id') id: string) {
    return this.nurseService.toggleActive(id);
  }
}
