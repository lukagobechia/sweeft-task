import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = getToken(request.headers);
    if (!token)
      throw new UnauthorizedException('Unauthorized access: No token provided');

    try {
      const payload = await this.jwtService.verify(token);

      if (!payload.isActive) {
        throw new UnauthorizedException('Unauthorized access: Inactive user');
      }
      
      request.user = { id: payload.id, isActive: payload.isActive };
      console.log('Request user:', request.user);
      return true;
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException(e.message);
    }
  }
}

export function getToken(headers: Record<string, any>): string | null {
  if (!headers['authorization']) {
    throw new UnauthorizedException('No authorization header provided');
  }
  const [type, token] = headers['authorization'].split(' ');

  return type === 'Bearer' ? token : null;
}
