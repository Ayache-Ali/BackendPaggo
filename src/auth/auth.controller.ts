import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;
    
    
    const user = await this.authService.validateUser(email, password);
    if (user) {

        if(user.password === password){
          const token = this.authService.generateJwt(user);
          return { message: 'Login successful', token, id: user.id };
        }else {
            return { message: 'Invalid credentials'};}

    } else {
      return { message: 'Invalid credentials'};
    }
  }
}