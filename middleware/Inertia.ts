import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { HEADERS } from '../src/utils';

export default class InertiaMiddleware {
  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    if (request.inertia()) {
      response.header(HEADERS.INERTIA_HEADER, true);
      response.header(HEADERS.VARY, 'Accept');
    }

    await next();
  }
}
