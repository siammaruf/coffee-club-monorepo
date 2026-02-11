import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { Request } from 'express';

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(Strategy, 'customer-jwt') {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.['customer_access'],
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'n/a',
    });
  }

  async validate(payload: any): Promise<Customer> {
    if (payload.type !== 'customer') {
      throw new UnauthorizedException('Invalid token type');
    }

    const customer = await this.customerRepository.findOne({
      where: { id: payload.sub },
    });

    if (!customer || !customer.is_active) {
      throw new UnauthorizedException('Customer not found or inactive');
    }

    return customer;
  }
}
