import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; 
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      return user; 
    }
    return null; 
  }
  generateJwt(user: any) {
    return this.jwtService.sign({ id: user.id, email: user.email });
  }
  
}

