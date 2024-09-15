import { Get, Controller, Render, Header, Param } from '@nestjs/common';
import { ActivityService } from 'src/activity/activity.service';

const getTimeDiff = (start: Date) => {
    const now = Date.now();
    const diff_millis = now - start.getTime();
    const hours = Math.floor(diff_millis / (1000 * 60 * 60));
    const minutes = Math.floor((diff_millis % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff_millis % (1000 * 60)) / 1000);
    if (hours > 0) {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    } else {
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

@Controller()
export class WidgetController {
    constructor(private readonly activityService: ActivityService) { }

    @Get('/:code/widget')
    @Render('index')
    @Header('Content-Type', 'image/svg+xml')
    @Header('Cache-Control', 'no-cache')
    @Header('Age', '0')
    async widget(@Param('code') code: string) {
        const activity = await this.activityService.getActivity(code);
    
        let editor: string = '';
        let filename: string = '';
        let workplace: string = '';
        let time: string = '';
        let no_coding_1: string = '';
        let no_coding_2: string = '';
        if (activity.statusCode !== 200 || activity.activities.length === 0) {
            no_coding_1 = 'There is no coding';
            no_coding_2 = 'activity yet ❤';
            
        } else {
            const _activity = activity.activities[0];
            editor = _activity.editor;
            filename = _activity.file ? `${_activity.debugging ? 'Debugging' : 'Editing'} ${_activity.file}` : 'Idling';
            workplace = _activity.workplace ? `Workplace: ${_activity.workplace}` : 'No workplace';
            time = `${getTimeDiff(_activity.start_time)} elapsed`;
        }

        return {
            editor: editor.length <= 24 ? editor : editor.slice(0, 24) + '...',
            filename: filename.length <= 28 ? filename : filename.slice(0, 25) + '...',
            workplace: workplace.length <= 34 ? workplace : workplace.slice(0, 31) + '...',
            time: time,
            no_coding_1: no_coding_1,
            no_coding_2: no_coding_2
        };
    }
}
