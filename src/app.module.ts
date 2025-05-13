import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { ConfigModule } from './config/config.module';
import { PartnershipModule } from './partnership/partnership.module';
import { OrderModule } from './order/order.module';
import { InventoryModule } from './inventory/inventory.module';
import { RetailerProductModule } from './retailer-product/retailer-product.module';
import { SupplierModule } from './supplier/supplier.module';
import { ProductionLineService } from './production-line/production-line.service';
import { ProductionLineController } from './production-line/production-line.controller';
import { ProductionLineModule } from './production-line/production-line.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ProductModule,
    ConfigModule,
    PartnershipModule,
    OrderModule,
    InventoryModule,
    RetailerProductModule,
    SupplierModule,
    ProductionLineModule,
  ],
  controllers: [AppController, ProductionLineController],
  providers: [AppService, ProductionLineService],
})
export class AppModule {}
