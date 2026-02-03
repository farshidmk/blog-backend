// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Res,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { type Response } from 'express';
// import { LocalAuthGuard } from './guards/local-auth.guard';
// import { JwtAuthGuard } from './guards/jwt-auth.guard';
// import { GetUser } from './decorators/get-user.decorator'; // we'll create this

/**
 * Authentication endpoints
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ────────────────────────────────────────────────
  //                  REGISTER
  // ────────────────────────────────────────────────
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    description: 'User successfully registered and auto-logged in',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'user@example.com',
          username: 'johndoe',
          phone: '+421905123456',
          role: 'USER',
        },
      },
    },
  })
  @ApiConflictResponse({
    description: 'Email, username or phone already exists',
  })
  @ApiBadRequestResponse({
    description: 'Validation failed (email, password length, etc.)',
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  // ────────────────────────────────────────────────
  //                     LOGIN
  // ────────────────────────────────────────────────
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user and return JWT access token' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    description: 'Login successful',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          email: 'user@example.com',
          username: 'johndoe',
          phone: '+421905123456',
          role: 'USER',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  // ────────────────────────────────────────────────
  //                GET CURRENT USER
  //          (protected route - example)
  // ────────────────────────────────────────────────
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiOkResponse({
    description: 'Returns current user data',
    schema: {
      example: {
        id: 1,
        email: 'user@example.com',
        username: 'johndoe',
        phone: '+421905123456',
        role: 'USER',
        createdAt: '2025-02-15T10:30:00.000Z',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  getCurrentUser(@GetUser() user: any) {
    return user;
  }

  // ────────────────────────────────────────────────
  //           LOGOUT (client-side only for JWT)
  // ────────────────────────────────────────────────
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout (client should delete token)',
    description:
      'For JWT-based authentication this is a client-side operation. ' +
      'This endpoint exists mainly for API consistency / future refresh token invalidation.',
  })
  @ApiOkResponse({
    description: 'Logged out successfully (client should clear token)',
  })
  logout(@Res() res: Response) {
    // If you later implement refresh tokens → here you can invalidate them
    res.status(HttpStatus.OK).json({
      message:
        'Logged out successfully. Please remove the access token from client storage.',
    });
  }
}
