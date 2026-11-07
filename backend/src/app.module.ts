import { StateModule } from './devices/state.module.js';
import { AuthModule } from './auth/auth.module.js';
import { DevicesModule } from './devices/devices.module.js';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './database/prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env: Record<string, unknown>) => {
        if (typeof env.DATABASE_URL !== 'string' || !env.DATABASE_URL)
          throw new Error('Configure DATABASE_URL no arquivo .env.');
        if (
          typeof env.JWT_SECRET !== 'string' ||
          env.JWT_SECRET.length < 32 ||
          env.JWT_SECRET === 'SUBSTITUA_POR_UMA_CHAVE_ALEATORIA'
        )
          throw new Error(
            'Configure JWT_SECRET com uma chave aleatória de pelo menos 32 caracteres.',
          );
        return env;
      },
    }),

    PrismaModule,
    StateModule,
    UsersModule,
    AuthModule,
    DevicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
