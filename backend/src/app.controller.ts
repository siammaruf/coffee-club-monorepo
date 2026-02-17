import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBasicAuth } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@Controller()
@ApiBasicAuth()
@Public()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
