import { Module } from "@nestjs/common";
import { MediaService } from "./media.service";
import { MediaController } from "./media.controller";
import { StorageService } from "./storage.service";
import { StorageController } from "./storage.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [MediaController, StorageController],
  providers: [MediaService, StorageService],
})
export class MediaModule {}
