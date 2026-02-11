import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../users/providers/user.service';
import { UserStatus } from '../../users/enum/user-status.enum';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.['access'], 
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'n/a',
    });
  }

  async validate(payload: any): Promise<UserResponseDto> {
    const user = await this.userService.findById(payload.sub);
    
    if (!user || user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException();
    }
    
    return user;
  }
}