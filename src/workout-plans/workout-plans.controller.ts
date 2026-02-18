import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
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
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { ReplaceWorkoutPlanExercisesDto } from './dto/replace-workout-plan-exercises.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';
import { WorkoutPlansService } from './workout-plans.service';

@ApiTags('workout-plans')
@Controller('workout-plans')
export class WorkoutPlansController {
  constructor(private readonly workoutPlansService: WorkoutPlansService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiCreatedResponse({ description: 'Workout plan created successfully' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  create(@Body() dto: CreateWorkoutPlanDto, @GetUserId() userId: number) {
    return this.workoutPlansService.create(dto, userId);
  }

  @Get()
  @ApiOkResponse({ description: 'Returns workout plans list' })
  findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.workoutPlansService.findAll(
      skip ? Number(skip) : 0,
      take ? Number(take) : 20,
    );
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Returns one workout plan by id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.workoutPlansService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: 'Workout plan updated successfully' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWorkoutPlanDto,
  ) {
    return this.workoutPlansService.update(id, dto);
  }

  @Put(':id/exercises')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: 'Workout plan exercises replaced successfully' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  replaceExercises(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReplaceWorkoutPlanExercisesDto,
  ) {
    return this.workoutPlansService.replaceExercises(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ description: 'Workout plan deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({ description: 'Insufficient permissions' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.workoutPlansService.remove(id);
  }
}

