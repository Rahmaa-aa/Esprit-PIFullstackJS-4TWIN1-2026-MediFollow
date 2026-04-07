import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { NurseService } from './nurse.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@Controller('nurses')
export class NurseController {
  constructor(private nurseService: NurseService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: { user?: { role?: string; id?: unknown; department?: string } }, @Body() body: any) {
    return this.nurseService.create(body, req.user);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async findAll(@Req() req: { user?: { role?: string; id?: unknown; department?: string } }) {
    return this.nurseService.findAll(req.user);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: { user?: { role?: string; id?: unknown; department?: string } }) {
    return this.nurseService.findById(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Req() req: { user?: { role?: string; id?: unknown; department?: string } },
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.nurseService.update(id, body, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Req() req: { user?: { role?: string; id?: unknown; department?: string } }, @Param('id') id: string) {
    return this.nurseService.delete(id, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/toggle-active')
  async toggleActive(@Req() req: { user?: { role?: string; id?: unknown; department?: string } }, @Param('id') id: string) {
    return this.nurseService.toggleActive(id, req.user);
  }
}
