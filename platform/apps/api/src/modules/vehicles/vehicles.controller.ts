import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { VehiclesService } from "./vehicles.service";
import { QueryVehiclesDto } from "./dto/query-vehicles.dto";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";
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

  /** Autenticado — estoque do próprio usuário. Declarado antes de :id. */
  @Get("mine")
  @UseGuards(JwtAuthGuard)
  listMine(@CurrentUser() user: JwtPayload) {
    return this.vehicles.listMine(user);
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

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  update(@CurrentUser() user: JwtPayload, @Param("id") id: string, @Body() dto: UpdateVehicleDto) {
    return this.vehicles.update(user, id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  remove(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.vehicles.remove(user, id);
  }
}
