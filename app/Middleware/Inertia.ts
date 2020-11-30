import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import Inertia from '../../src/Inertia';

export default class InertiaMiddleware {
  public async handle(ctx: HttpContextContract, next: () => Promise<void>) {
    ctx.inertia = new Inertia(ctx);

    await next();
  }
}
