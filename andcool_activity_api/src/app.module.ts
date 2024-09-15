import { Module } from '@nestjs/common';
import { ActivityController } from './activity/activity.controller';
import { ActivityService } from './activity/activity.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaService } from './prisma/prisma.service';
import { WidgetController } from './widget/widget.controller';

@Module({
    imports: [
        CacheModule.register(),
        ConfigModule.forRoot(),
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 50,
        }])
    ],
    controllers: [ActivityController, WidgetController],
    providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }, ActivityService, PrismaService],
})
export class AppModule { }
