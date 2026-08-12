import { Controller, Get, Module, Param, Query } from "@nestjs/common";
import { Fuel } from "@prisma/client";
import { CatalogService } from "./catalog.service";

@Controller("catalog")
class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  /** Marcas disponíveis no catálogo (com contagem de modelos). */
  @Get("makes")
  makes() {
    return this.catalog.makes();
  }

  /** Modelos do catálogo — base de prefill ao criar anúncios. Público. */
  @Get("models")
  models(
    @Query("make") make?: string,
    @Query("segment") segment?: string,
    @Query("fuel") fuel?: Fuel,
    @Query("q") q?: string,
  ) {
    return this.catalog.models({ make, segment, fuel, q });
  }

  @Get("models/:id")
  findOne(@Param("id") id: string) {
    return this.catalog.findOne(id);
  }
}

@Module({
  controllers: [CatalogController],
  providers: [CatalogService],
})
export class CatalogModule {}
