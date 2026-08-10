import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { MembershipRole } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { InviteMemberDto } from "./dto/team.dto";

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    const rows = await this.prisma.membership.findMany({
      where: { tenantId },
      orderBy: { invitedAt: "asc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    return rows.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      status: m.status,
    }));
  }

  /** Convida um membro: cria o usuário (se novo) e a associação ao tenant. */
  async invite(tenantId: string, dto: InviteMemberDto) {
    let user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      // Sem senha: o membro define via "esqueci a senha" ou login social.
      user = await this.prisma.user.create({
        data: { name: dto.name, email: dto.email, type: "SHOPKEEPER" },
      });
    }

    const existing = await this.prisma.membership.findUnique({
      where: { userId_tenantId: { userId: user.id, tenantId } },
    });
    if (existing) throw new ConflictException("Este usuário já faz parte da equipe");

    const membership = await this.prisma.membership.create({
      data: { userId: user.id, tenantId, role: dto.role, status: "ACTIVE", joinedAt: new Date() },
    });
    return { id: membership.id, name: user.name, email: user.email, role: membership.role, status: membership.status };
  }

  async changeRole(tenantId: string, membershipId: string, role: MembershipRole) {
    const m = await this.prisma.membership.findFirst({ where: { id: membershipId, tenantId } });
    if (!m) throw new NotFoundException("Membro não encontrado");
    if (m.role === "ADMIN" && role !== "ADMIN") await this.assertNotLastAdmin(tenantId, membershipId);
    return this.prisma.membership.update({ where: { id: membershipId }, data: { role } });
  }

  async remove(tenantId: string, membershipId: string, currentUserId: string) {
    const m = await this.prisma.membership.findFirst({ where: { id: membershipId, tenantId } });
    if (!m) throw new NotFoundException("Membro não encontrado");
    if (m.userId === currentUserId) throw new ForbiddenException("Você não pode remover a si mesmo");
    if (m.role === "ADMIN") await this.assertNotLastAdmin(tenantId, membershipId);
    await this.prisma.membership.delete({ where: { id: membershipId } });
    return { ok: true };
  }

  private async assertNotLastAdmin(tenantId: string, membershipId: string) {
    const admins = await this.prisma.membership.count({ where: { tenantId, role: "ADMIN", status: "ACTIVE" } });
    const isThisAdmin = await this.prisma.membership.findFirst({ where: { id: membershipId, role: "ADMIN" } });
    if (admins <= 1 && isThisAdmin) throw new BadRequestException("A loja precisa de ao menos um administrador");
  }
}
