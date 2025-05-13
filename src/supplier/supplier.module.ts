import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { SupplierService } from './supplier.service';
import { SupplierController } from './supplier.controller';

@Module({
  controllers: [SupplierController],
  providers: [SupplierService, PrismaService],
  exports: [SupplierService],
})
export class SupplierModule {}
