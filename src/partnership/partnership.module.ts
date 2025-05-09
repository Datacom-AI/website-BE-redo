import { Module } from '@nestjs/common';
import { PartnershipController } from './partnership.controller';
import { PartnershipService } from './partnership.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [PartnershipController],
  providers: [PartnershipService, PrismaService],
})
export class PartnershipModule {}
