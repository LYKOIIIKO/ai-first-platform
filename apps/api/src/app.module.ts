import { Module } from '@nestjs/common';
import { AccessModule } from './modules/access/access.module';
import { AgentConnectionsModule } from './modules/agent-connections/agent-connections.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { HealthModule } from './transport/health/health.module';

@Module({
  imports: [AccessModule, AgentConnectionsModule, EmployeesModule, IntegrationsModule, ProjectsModule, HealthModule],
})
export class AppModule {}
