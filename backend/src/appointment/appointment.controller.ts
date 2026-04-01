import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { AppointmentService } from './appointment.service';

@Controller('appointments')
export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}

  @Post()
  create(@Body() body: any) {
    return this.appointmentService.create(body);
  }

  @Get('patient/:id')
  getByPatient(@Param('id') id: string) {
    return this.appointmentService.getByPatient(id);
  }

  @Get('patient/:id/upcoming')
  getUpcoming(@Param('id') id: string) {
    return this.appointmentService.getUpcoming(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.appointmentService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentService.remove(id);
  }
}
