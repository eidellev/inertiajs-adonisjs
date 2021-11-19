declare module '@ioc:EidelLev/Inertia/Middleware' {
  import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

  export default class InertiaMiddleware {
    public handle(ctx: HttpContextContract, next: () => Promise<void>);
  }
}
