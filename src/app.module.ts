import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { EmailModule } from './email/email.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [UserModule, AuthModule, ProductModule, EmailModule, ConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
