import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiBasicAuth } from '@nestjs/swagger';

@Controller()
@ApiBasicAuth()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
