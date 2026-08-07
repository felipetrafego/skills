import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient, Prisma } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Executa `fn` numa transação com o tenant fixado para o RLS do Postgres
   * (`app.tenant_id`). É o ponto de integração das policies em prisma/policies/rls.sql:
   * quando a aplicação conecta com um papel não-dono, o banco passa a devolver
   * apenas as linhas do tenant informado — defesa em profundidade ao filtro de app.
   */
  withTenant<T>(tenantId: string, fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
      return fn(tx);
    });
  }
}
