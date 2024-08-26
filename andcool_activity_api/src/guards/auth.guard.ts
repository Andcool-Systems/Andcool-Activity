import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { Activity, User } from '@prisma/client';


export interface Session extends User {
    activities: Activity[];
}

export interface RequestSession extends Request {
    session: Session;
}

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly prismaService: PrismaService) { }

    sendDeny(response: Response) {
        response.status(401).send({
            statusCode: 401,
            message: 'Unauthorized'
        });
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        /* Auth Guard */

        const request = context.switchToHttp().getRequest();
        const response: Response = context.switchToHttp().getResponse();
        const authorization = request.headers.authorization;
        if (!authorization) {
            this.sendDeny(response);
            return false;
        }

        const parts = authorization.split(' ');
        if (parts[0] !== 'Api-Key') {
            this.sendDeny(response);
            return false;
        }

        const user = await this.prismaService.user.findFirst({ where: { token: parts[1] }, include: { activities: true } });
        if (!user) {
            this.sendDeny(response);
            return false;
        }

        request.session = user;
        return true;
    }
}