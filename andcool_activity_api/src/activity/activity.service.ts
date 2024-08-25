import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { HeartbeatDto } from './dto/activity.dto';


interface Activity {
    id: number,
    workplace: string,
    file: string,
    debugging: boolean,
    last_heartbeat: Date,
    start_time: Date,
}

@Injectable()
export class ActivityService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

    async heartbeat(body: HeartbeatDto) {
        const cache: string = await this.cacheManager.get('activity') ?? '[]';
        let parsed = JSON.parse(cache) as Activity[];
        const now = new Date();

        const activity = parsed.find((activity) => activity.id === body.id);
        if (activity) {
            activity.workplace = body.workplace;
            activity.file = body.file;
            activity.debugging = body.debugging;
            activity.last_heartbeat = now;
        } else {
            parsed.push({
                id: body.id,
                workplace: body.workplace,
                file: body.file,
                debugging: body.debugging,
                last_heartbeat: now,
                start_time: now
            });
        }

        await this.cacheManager.set('activity', JSON.stringify(parsed), 0);
    }

    async getActivity() {
        const cache: string = await this.cacheManager.get('activity') ?? '[]';
        const TTL = Number(process.env.TTL);
        const now_date = Date.now();

        const parsed: Activity[] = JSON.parse(cache).filter((activity: Activity) => {
            const last_heartbeat = new Date(activity.last_heartbeat).getTime();
            return now_date - last_heartbeat <= TTL;
        });

        await this.cacheManager.set('activity', JSON.stringify(parsed), 0);
        return parsed.map((activity) => ({
            id: activity.id,
            workplace: activity.workplace,
            file: activity.file,
            debugging: activity.debugging,
            start_time: activity.start_time,
        }));
    }
}
