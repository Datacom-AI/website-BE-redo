// src/common/mappers/mappers.module.ts
import { Module } from '@nestjs/common';
import { UserMapperService } from './user.mapper';
// Import other mapper services here if you create them

@Module({
  providers: [UserMapperService],
  exports: [UserMapperService], // Export services so other modules can use them
})
export class MappersModule {}
