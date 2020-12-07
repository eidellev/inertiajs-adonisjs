import { ResponseProps, InertiaConfig, InertiaContract, ShareCallback } from '@ioc:EidelLev/Inertia';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { ConfigContract } from '@ioc:Adonis/Core/Config';

enum HEADERS {
  INERTIA_HEADER = 'x-inertia',
  INERTIA_PARTIAL_DATA_HEADER = 'x-inertia-partial-data',
}

let sharedData = {};

export class Inertia implements InertiaContract {
  constructor(private ctx: HttpContextContract, private config: ConfigContract) {}

  public static share(data: Record<string, string | number | object | boolean | ShareCallback>): void {
    sharedData = data;
  }

  public isInertia(): boolean {
    const { request } = this.ctx;
    return !!request.header(HEADERS.INERTIA_HEADER);
  }

  public async render(component: string, responseProps?: ResponseProps): Promise<Record<string, unknown> | string> {
    const { view }: InertiaConfig = this.config.get('app.inertia', { view: 'app' });
    const { request, response } = this.ctx;
    const isInertia = this.isInertia();
    const partialData = (request.header(HEADERS.INERTIA_PARTIAL_DATA_HEADER) || '').split(',').filter(Boolean);
    let props: ResponseProps = { ...sharedData, ...responseProps };

    // Keep only partial data
    if (partialData.length > 0) {
      const filteredProps = Object.entries(props).filter(([key]) => {
        return partialData.includes(key);
      });

      props = Object.fromEntries(filteredProps);
    }

    // Resolve lazy props
    Object.entries(props).forEach(([key, value]) => {
      if (typeof value === 'function') {
        const resolvedValue = value({ ctx: this.ctx, component, props });
        props[key] = resolvedValue;
      }
    });

    // Resolve promises
    const result = await Promise.all(
      Object.entries(props).map(async ([key, value]) => {
        return [key, await value];
      }),
    );

    // Marshall back into an object
    props = Object.fromEntries(result);

    // Keep original request query params
    const queryParams = new URLSearchParams(request.all()).toString();
    const data = {
      component,
      // version,
      props,
      url: `${request.url()}${queryParams && `?${queryParams}`}`,
    };

    if (isInertia) {
      response.header(HEADERS.INERTIA_HEADER, 'true');
      return data;
    }

    return this.ctx.view.render(view, { data });
  }

  public redirectBack() {
    const { response } = this.ctx;

    response.status(303).redirect().back();
  }
}
