import { Controller, ForbiddenException, Get, Query, Req, UseGuards } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('departments')
export class DepartmentController {
  constructor(private departmentService: DepartmentService) {}

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  async summary() {
    return this.departmentService.listSummaries();
  }

  /** GET /api/departments/doctor/my-nurses */
  @UseGuards(JwtAuthGuard)
  @Get('doctor/my-nurses')
  async myNursesForDoctor(@Req() req: { user?: { id: unknown; role: string } }) {
    const user = req.user;
    if (!user || user.role !== 'doctor') {
      throw new ForbiddenException('Accès réservé aux médecins');
    }
    return this.departmentService.getNursesForDoctor(String(user.id));
  }

  /** GET /api/departments/doctor/my-doctors */
  @UseGuards(JwtAuthGuard)
  @Get('doctor/my-doctors')
  async myDoctorsForDoctor(@Req() req: { user?: { id: unknown; role: string } }) {
    const user = req.user;
    if (!user || user.role !== 'doctor') {
      throw new ForbiddenException('Accès réservé aux médecins');
    }
    return this.departmentService.getDoctorsForDoctor(String(user.id));
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async usersByDepartment(@Query('department') department: string) {
    return this.departmentService.getUsersByDepartment(department || '');
  }
}
