import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CareCoordinatorFollowupService } from './care-coordinator-followup.service';
import { AdminDashboardService } from './admin-dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('departments')
export class DepartmentController {
  constructor(
    private departmentService: DepartmentService,
    private careCoordinatorFollowup: CareCoordinatorFollowupService,
    private adminDashboard: AdminDashboardService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('summary')
  async summary() {
    return this.departmentService.listSummaries();
  }

  /** Statistiques agrégées pour le tableau de bord administrateur (hôpital). */
  @UseGuards(JwtAuthGuard)
  @Get('admin/dashboard-stats')
  async adminDashboardStats(@Req() req: { user?: { role?: string } }) {
    const role = req.user?.role;
    if (!role || !['admin', 'superadmin', 'carecoordinator', 'auditor'].includes(role)) {
      throw new ForbiddenException('Accès réservé au personnel d’administration');
    }
    return this.adminDashboard.getDashboardStats();
  }

  /** Noms fusionnés pour les formulaires (patient, médecin, infirmier, coordinateur). */
  @UseGuards(JwtAuthGuard)
  @Get('catalog')
  async catalog() {
    const names = await this.departmentService.listMergedDepartmentNames();
    return { names };
  }

  /** Catalogue : départements sans admin (création admin plateforme). Super admin uniquement. */
  @UseGuards(JwtAuthGuard)
  @Get('catalog/eligible-for-admin')
  async catalogEligibleForAdmin(@Req() req: { user?: { role?: string } }) {
    if (req.user?.role !== 'superadmin') {
      throw new ForbiddenException('Seul le super administrateur peut consulter cette liste');
    }
    const names = await this.departmentService.listCatalogDepartmentNamesWithoutAssignedAdmin();
    return { names };
  }

  /** Noms du catalogue uniquement (formulaires auditeur / rôles sans bruit des fusions). */
  @UseGuards(JwtAuthGuard)
  @Get('catalog/names-only')
  async catalogNamesOnly() {
    const names = await this.departmentService.listCatalogDepartmentNamesOnly();
    return { names };
  }

  /** Assure une entrée catalogue pour un nom déjà utilisé ailleurs (super admin, idempotent). */
  @UseGuards(JwtAuthGuard)
  @Post('catalog/ensure')
  async ensureCatalogDepartment(
    @Req() req: { user?: { role?: string } },
    @Body() body: { name?: string },
  ) {
    if (req.user?.role !== 'superadmin') {
      throw new ForbiddenException('Seul le super administrateur peut gérer le catalogue');
    }
    return this.departmentService.ensureCatalogDepartment(body.name || '');
  }

  /** Ajout au catalogue (super administrateur uniquement). */
  @UseGuards(JwtAuthGuard)
  @Post()
  async createCatalogDepartment(
    @Req() req: { user?: { role?: string } },
    @Body() body: { name?: string },
  ) {
    if (req.user?.role !== 'superadmin') {
      throw new ForbiddenException('Seul le super administrateur peut créer un département');
    }
    return this.departmentService.createCatalogDepartment(body.name || '');
  }

  @UseGuards(JwtAuthGuard)
  @Patch('catalog/:catalogId/assign')
  async assignCatalogAdmin(
    @Req() req: { user?: { role?: string } },
    @Param('catalogId') catalogId: string,
    @Body() body: { adminUserId?: string | null; superAdminUserId?: string | null },
  ) {
    if (req.user?.role !== 'superadmin') {
      throw new ForbiddenException(
        'Seul le super administrateur peut assigner un administrateur au département',
      );
    }
    const raw = body.adminUserId ?? body.superAdminUserId;
    const id =
      raw === null || raw === undefined || raw === ''
        ? null
        : String(raw);
    return this.departmentService.assignAdminToCatalogDepartment(catalogId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('catalog/:catalogId')
  async updateCatalogDepartment(
    @Req() req: { user?: { role?: string } },
    @Param('catalogId') catalogId: string,
    @Body() body: { name?: string },
  ) {
    if (req.user?.role !== 'superadmin') {
      throw new ForbiddenException('Seul le super administrateur peut modifier un département du catalogue');
    }
    return this.departmentService.updateCatalogDepartment(catalogId, body.name || '');
  }

  @UseGuards(JwtAuthGuard)
  @Delete('catalog/:catalogId')
  async deleteCatalogDepartment(
    @Req() req: { user?: { role?: string } },
    @Param('catalogId') catalogId: string,
  ) {
    if (req.user?.role !== 'superadmin') {
      throw new ForbiddenException('Seul le super administrateur peut supprimer un département du catalogue');
    }
    return this.departmentService.deleteCatalogDepartment(catalogId);
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

  /** Statistiques agrégées pour le tableau de bord coordinateur. */
  @UseGuards(JwtAuthGuard)
  @Get('coordinator/dashboard-stats')
  async coordinatorDashboardStats(@Req() req: { user?: { id?: unknown; role?: string; department?: string } }) {
    const user = req.user;
    if (!user || user.role !== 'carecoordinator') {
      throw new ForbiddenException('Accès réservé aux coordinateurs de soins');
    }
    return this.careCoordinatorFollowup.getDashboardStats(user as any);
  }

  /** Patients du même département + scores de suivi (7 jours). */
  @UseGuards(JwtAuthGuard)
  @Get('coordinator/my-patients')
  async coordinatorMyPatients(@Req() req: { user?: { id?: unknown; role?: string; department?: string } }) {
    const user = req.user;
    if (!user || user.role !== 'carecoordinator') {
      throw new ForbiddenException('Accès réservé aux coordinateurs de soins');
    }
    return this.careCoordinatorFollowup.listMyDepartmentPatients(user as any);
  }

  /** Historique constantes + médicaments (12 mois) pour un patient du département. */
  @UseGuards(JwtAuthGuard)
  @Get('coordinator/patient/:patientId/history')
  async coordinatorPatientHistory(
    @Req() req: { user?: { id?: unknown; role?: string; department?: string } },
    @Param('patientId') patientId: string,
  ) {
    const user = req.user;
    if (!user || user.role !== 'carecoordinator') {
      throw new ForbiddenException('Accès réservé aux coordinateurs de soins');
    }
    return this.careCoordinatorFollowup.getPatientHistory(user as any, patientId);
  }
}
