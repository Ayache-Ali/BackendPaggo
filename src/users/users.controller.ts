import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    @Post('register')
    async register(@Body() body: { email: string; password: string }) {
        return this.usersService.createUser(body);
    }
    
}