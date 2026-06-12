import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import type { Request } from 'express';
import type { Configuration } from '../../config/configuration';

@Injectable()
export class WebhookSignatureGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService<Configuration, true>,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const signature = request.headers['x-hub-signature-256'];

    if (typeof signature !== 'string') {
      throw new UnauthorizedException('Missing webhook signature');
    }

    const secret = this.configService.get('github.webhookSecret', {
      infer: true,
    });

    if (!secret) {
      throw new UnauthorizedException('Webhook secret is not configured');
    }

    const rawBody = (request as Request & { rawBody?: Buffer }).rawBody;

    if (!rawBody) {
      throw new UnauthorizedException('Missing raw request body');
    }

    const expected = `sha256=${createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')}`;

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return true;
  }
}
