import { Body, Controller, Get, Param, Post, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { HeartbeatDto } from './dto/activity.dto';
import type { Response } from 'express'
import { AuthGuard, RequestSession } from 'src/guards/auth.guard';
import { EndActivityDto } from './dto/endActivity.dto';

@Controller()
export class ActivityController {
    constructor(private readonly activityService: ActivityService) { }

    @Get('/:code')
    async getActivity(@Param('code') code: string, @Res() res: Response) {
        const activity = await this.activityService.getActivity(code);
        res.status(activity.statusCode).send(activity);
    }

    @Post('/heartbeat')
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async heartbeat(@Req() request: RequestSession, @Res() res: Response, @Body() body: HeartbeatDto) {
        const response = await this.activityService.heartbeat(body, request.session);
        res.status(response.statusCode).send(response);
    }

    @Post('/end')
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async endActivity(@Req() request: RequestSession, @Res() res: Response, @Body() body: EndActivityDto) {
        const data = await this.activityService.endActivity(body, request.session);
        res.status(data.statusCode).send(data);
    }

    @Post('/register')
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async register(@Res() res: Response) {
        const data = await this.activityService.register();
        res.status(data.statusCode).send(data);
    }
}
