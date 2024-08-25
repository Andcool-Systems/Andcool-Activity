import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.enableCors({
		origin: (_, callback) => {
			callback(null, true);
		},
		credentials: true,
	});
	app.use(morgan(':method :url :status - :response-time ms'));
	await app.listen(8004);
}
bootstrap();