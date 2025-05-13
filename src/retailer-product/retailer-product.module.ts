import { Module } from '@nestjs/common';
import { RetailerProductService } from './retailer-product.service';
import { RetailerProductController } from './retailer-product.controller';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [RetailerProductController],
  providers: [RetailerProductService, PrismaService, ConfigService],
  exports: [RetailerProductService],
})
export class RetailerProductModule {}
