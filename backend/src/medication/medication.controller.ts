import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { MedicationService } from './medication.service';

@Controller('medications')
export class MedicationController {
  constructor(private medicationService: MedicationService) {}

  @Post()
  create(@Body() body: any) {
    return this.medicationService.create(body);
  }

  @Get('patient/:id')
  getByPatient(@Param('id') id: string) {
    return this.medicationService.getByPatient(id);
  }

  @Put(':id/toggle-taken')
  toggleTaken(@Param('id') id: string) {
    return this.medicationService.toggleTakenToday(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.medicationService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicationService.remove(id);
  }
}
