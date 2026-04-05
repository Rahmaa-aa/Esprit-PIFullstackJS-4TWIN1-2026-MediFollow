import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('dashboard')
  @Roles('auditor', 'superadmin')
  getDashboard() {
    return this.auditService.getDashboard();
  }

  /** Liste paginée — route statique avant tout paramètre dynamique. */
  @Get('logs')
  @Roles('auditor', 'superadmin')
  getLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userSearch') userSearch?: string,
    @Query('actorRole') actorRole?: string,
    @Query('actionType') actionType?: string,
    @Query('resourceType') resourceType?: string,
    @Query('datePreset') datePreset?: 'today' | 'week' | 'month' | 'all',
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.auditService.findLogs({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      userSearch,
      actorRole,
      actionType,
      resourceType,
      datePreset,
      dateFrom,
      dateTo,
    });
  }

  /** Détail — sous-chemin pour éviter toute ambiguïté avec GET /logs */
  @Get('logs/item/:id')
  @Roles('auditor', 'superadmin')
  getLogById(@Param('id') id: string) {
    return this.auditService.findById(id);
  }
}
