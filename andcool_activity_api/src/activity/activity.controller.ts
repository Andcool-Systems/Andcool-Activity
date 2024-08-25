import { Body, Controller, Get, Post, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { HeartbeatDto } from './dto/activity.dto';
import type { Response } from 'express'
import { AuthGuard } from 'src/guards/auth.guard';

@Controller()
export class ActivityController {
    constructor(private readonly activityService: ActivityService) { }

    @Get()
    async getActivity(@Res() res: Response) {
        const activity = await this.activityService.getActivity();
        res.status(200).send(activity);
    }

    @Post('/heartbeat')
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async heartbeat(@Res() res: Response, @Body() body: HeartbeatDto) {
        await this.activityService.heartbeat(body);
        res.status(201).send();
    }
}
