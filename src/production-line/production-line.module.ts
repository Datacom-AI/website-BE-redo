import { Module } from '@nestjs/common';
import { ProductionLineController } from './production-line.controller';
import { ProductionLineService } from './production-line.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ProductionLineController],
  providers: [ProductionLineService, PrismaService],
  exports: [ProductionLineService],
})
export class ProductionLineModule {}
