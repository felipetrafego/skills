import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { VehiclesService } from "./vehicles.service";
import { QueryVehiclesDto } from "./dto/query-vehicles.dto";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import type { JwtPayload } from "../../common/auth/jwt-payload";

@Controller("vehicles")
export class VehiclesController {
  constructor(private readonly vehicles: VehiclesService) {}

  /** Público — busca do marketplace (respeita a vitrine do tenant se houver contexto). */
  @Get()
  search(@Query() query: QueryVehiclesDto) {
    return this.vehicles.search(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.vehicles.findOne(id);
  }

  /** Autenticado — cria anúncio (lojista via tenant, ou pessoa física). */
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateVehicleDto) {
    return this.vehicles.createForTenant(user, dto);
  }
}
