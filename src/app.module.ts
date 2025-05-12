import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { EmailModule } from './email/email.module';
import { ConfigModule } from './config/config.module';
import { PartnershipModule } from './partnership/partnership.module';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ProductModule,
    EmailModule,
    ConfigModule,
    PartnershipModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
