import { Logger, Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, PrismaService, Logger],
})
export class OrderModule {}
