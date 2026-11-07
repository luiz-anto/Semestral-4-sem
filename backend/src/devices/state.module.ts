import { Global, Module } from '@nestjs/common';
import { StateRepository } from './repositories/state.repository.js';
@Global()
@Module({ providers: [StateRepository], exports: [StateRepository] })
export class StateModule {}
