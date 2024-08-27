import { Injectable } from '@nestjs/common';
import { HeartbeatDto } from './dto/activity.dto';
import { EndActivityDto } from './dto/endActivity.dto';
import { Session } from 'src/guards/auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';


interface Activity {
    id: number;
    workplace: string;
    file: string;
    editor: string;
    debugging: boolean;
    start_time: Date;
    last_heartbeat: Date;
    Userid: number | null;
}

@Injectable()
export class ActivityService {
    constructor(private readonly prismaService: PrismaService) { }

    async heartbeat(body: HeartbeatDto, session: Session) {
        const activity = await this.prismaService.activity.findFirst({ where: { id: body.id } });

        if (!activity) {
            await this.prismaService.activity.create({
                data: {
                    id: body.id,
                    workplace: body.workplace,
                    file: body.file,
                    debugging: body.debugging,
                    editor: body.editor,
                    User: { connect: { id: session.id } }
                }
            });
            return { statusCode: 201 }
        }

        if (activity.Userid !== session.id) {
            return { statusCode: 403, message: 'Forbidden' };
        }

        await this.prismaService.activity.update({
            where: { id: activity.id },
            data: {
                workplace: body.workplace,
                file: body.file,
                debugging: body.debugging,
                editor: body.editor,
                last_heartbeat: new Date()
            }
        });

        return { statusCode: 201 }
    }

    async getActivity(code: string) {
        const user = await this.prismaService.user.findFirst({ where: { code: code }, include: { activities: true } });

        if (!user) {
            return {
                statusCode: 404,
                message: 'Activity not found'
            }
        }

        const TTL = Number(process.env.TTL);

        const parsed: Activity[] = user.activities.filter((activity: Activity) => {
            const now_date = new Date().getTime();
            const last_heartbeat = new Date(activity.last_heartbeat).getTime();
            if (now_date - last_heartbeat > TTL) {
                this.prismaService.activity.delete({ where: { id: activity.id } }).then();
            }
            return now_date - last_heartbeat <= TTL;
        });

        return {
            statusCode: 200,
            activities: parsed.map((activity) => ({
                id: activity.id,
                workplace: activity.workplace,
                file: activity.file,
                editor: activity.editor,
                debugging: activity.debugging,
                start_time: activity.start_time,
            }))
        };
    }

    async endActivity(body: EndActivityDto, session: Session) {
        const activity = await this.prismaService.activity.findFirst({ where: { id: body.id } });

        if (!activity) {
            return {
                statusCode: 404,
                message: 'Activity not found'
            }
        }

        if (activity.Userid !== session.id) {
            return { statusCode: 403, message: 'Forbidden' };
        }

        await this.prismaService.activity.delete({ where: { id: activity.id } });
        return { statusCode: 200 }
    }

    async register() {
        const user = await this.prismaService.user.create({
            data: {
                token: uuidv4(),
                code: Math.random().toString(36).substring(2, 8)
            }
        });

        return {
            statusCode: 201,
            token: user.token,
            code: user.code
        }
    }
}
