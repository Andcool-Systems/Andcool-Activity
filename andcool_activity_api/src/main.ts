import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	app.enableCors({
		origin: (_, callback) => {
			callback(null, true);
		},
		credentials: true,
	});

	app.useStaticAssets(join(__dirname, '../src', 'public'));
	app.setBaseViewsDir(join(__dirname, '../src', 'widget/views'));
	app.setViewEngine('hbs');

	await app.listen(8003);
}
bootstrap();