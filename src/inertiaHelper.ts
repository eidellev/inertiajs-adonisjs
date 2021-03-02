import { RequestContract } from '@ioc:Adonis/Core/Request';
import { HEADERS } from './utils';

export function inertiaHelper(request: RequestContract) {
  return !!request.header(HEADERS.INERTIA_HEADER);
}
