import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        /* Auth Guard */

        const request = context.switchToHttp().getRequest();
        const response: Response = context.switchToHttp().getResponse();

        const authorization = request.headers.authorization;
        if (!authorization) {
            response.status(401).send({
                statusCode: 401,
                message: 'Unauthorized'
            });
            return false;
        }

        const parts = authorization.split(' ');
        if (parts[0] !== 'Api-Key' || parts[1] !== process.env.API_KEY_AUTH) {
            response.status(401).send({
                statusCode: 401,
                message: 'Unauthorized'
            });
            return false;
        }

        return true;
    }
}