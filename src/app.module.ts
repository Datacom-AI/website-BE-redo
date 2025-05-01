import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { EmailModule } from './email/email.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [UsersModule, AuthModule, ProductModule, EmailModule, ConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
