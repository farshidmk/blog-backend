import {
  Body,
  Controller,
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
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUserId } from '../common/decorators/get-userId.decorator';
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import { CreateWorkoutSetLogDto } from './dto/create-workout-set-log.dto';
import { FinishWorkoutSessionDto } from './dto/finish-workout-session.dto';
import { UpdateWorkoutSetLogDto } from './dto/update-workout-set-log.dto';
import { WorkoutSessionsService } from './workout-sessions.service';

@ApiTags('workout-sessions')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
@UseGuards(JwtAuthGuard)
@Controller('workout-sessions')
export class WorkoutSessionsController {
  constructor(private readonly workoutSessionsService: WorkoutSessionsService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Workout session created successfully' })
  create(@GetUserId() userId: number, @Body() dto: CreateWorkoutSessionDto) {
    return this.workoutSessionsService.create(userId, dto);
  }

  @Get('me')
  @ApiOkResponse({ description: 'Returns current user workout sessions' })
  findMine(
    @GetUserId() userId: number,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.workoutSessionsService.findMine(
      userId,
      skip ? Number(skip) : 0,
      take ? Number(take) : 20,
    );
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Returns one workout session' })
  findOneMine(@GetUserId() userId: number, @Param('id', ParseIntPipe) id: number) {
    return this.workoutSessionsService.findOneMine(userId, id);
  }

  @Patch(':id/finish')
  @ApiOkResponse({ description: 'Workout session finished successfully' })
  finish(
    @GetUserId() userId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: FinishWorkoutSessionDto,
  ) {
    return this.workoutSessionsService.finish(userId, id, dto);
  }

  @Post(':id/set-logs')
  @ApiCreatedResponse({ description: 'Workout set log created successfully' })
  addSetLog(
    @GetUserId() userId: number,
    @Param('id', ParseIntPipe) sessionId: number,
    @Body() dto: CreateWorkoutSetLogDto,
  ) {
    return this.workoutSessionsService.addSetLog(userId, sessionId, dto);
  }

  @Get(':id/set-logs')
  @ApiOkResponse({ description: 'Returns workout set logs for one session' })
  listSetLogs(
    @GetUserId() userId: number,
    @Param('id', ParseIntPipe) sessionId: number,
  ) {
    return this.workoutSessionsService.listSetLogs(userId, sessionId);
  }

  @Patch('set-logs/:setLogId')
  @ApiOkResponse({ description: 'Workout set log updated successfully' })
  updateSetLog(
    @GetUserId() userId: number,
    @Param('setLogId', ParseIntPipe) setLogId: number,
    @Body() dto: UpdateWorkoutSetLogDto,
  ) {
    return this.workoutSessionsService.updateSetLog(userId, setLogId, dto);
  }
}

