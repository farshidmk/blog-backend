import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetUserId } from '../common/decorators/get-userId.decorator';
import { CreateUserWorkoutPlanDto } from './dto/create-user-workout-plan.dto';
import { UpdateUserWorkoutPlanDto } from './dto/update-user-workout-plan.dto';
import { UserWorkoutPlansService } from './user-workout-plans.service';

@ApiTags('user-workout-plans')
@Controller('user-workout-plans')
export class UserWorkoutPlansController {
  constructor(
    private readonly userWorkoutPlansService: UserWorkoutPlansService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiCreatedResponse({ description: 'User workout plan created successfully' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  create(@Body() dto: CreateUserWorkoutPlanDto) {
    return this.userWorkoutPlansService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: 'Returns all user workout plans' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.userWorkoutPlansService.findAll(
      skip ? Number(skip) : 0,
      take ? Number(take) : 20,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: 'Returns current user workout plans' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  findMine(@GetUserId() userId: number) {
    return this.userWorkoutPlansService.findMine(userId);
  }

  @Get('me/active')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: 'Returns current user active workout plan' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  findMyActive(@GetUserId() userId: number) {
    return this.userWorkoutPlansService.findMyActive(userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: 'User workout plan updated successfully' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserWorkoutPlanDto,
  ) {
    return this.userWorkoutPlansService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: 'User workout plan deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userWorkoutPlansService.remove(id);
  }
}

