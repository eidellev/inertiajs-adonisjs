import {
  ResponseProps,
  InertiaConfig,
  InertiaContract,
  SharedData,
  Version,
  VersionValue,
} from '@ioc:EidelLev/Inertia';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import { ResponseContract } from '@ioc:Adonis/Core/Response';
import { HEADERS } from './utils';

export class Inertia implements InertiaContract {
  private static sharedData: SharedData = {};
  private static currentVersion: Version;

  constructor(private ctx: HttpContextContract, private config: InertiaConfig) {}

  public static share(data: SharedData) {
    Inertia.sharedData = data;
    return Inertia;
  }

  public static version(version: Version) {
    Inertia.currentVersion = version;
    return Inertia;
  }

  public async render(
    component: string,
    responseProps?: ResponseProps,
  ): Promise<Record<string, unknown> | string | ResponseContract> {
    const { view } = this.config;
    const { request, response } = this.ctx;
    const isInertia = request.inertia();
    response.header(HEADERS.INERTIA_HEADER, 'true');

    const partialData = (request.header(HEADERS.INERTIA_PARTIAL_DATA_HEADER) || '').split(',').filter(Boolean);
    const requestAssetVersion = request.header(HEADERS.INERTIA_VERSION);
    let props: ResponseProps = { ...Inertia.sharedData, ...responseProps };

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
        const resolvedValue = value(this.ctx);
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

    // Get asset version
    const version = await this.resolveVersion();
    // Keep original request query params
    const queryParams = new URLSearchParams(request.all()).toString();
    const url = `${request.url()}${queryParams && `?${queryParams}`}`;
    const data = {
      component,
      version,
      props,
      url,
    };

    const isGet = request.method() === 'GET';
    const assetsChanged = requestAssetVersion && requestAssetVersion !== version;

    if (isInertia && isGet && assetsChanged) {
      return response.status(409).header(HEADERS.INERTIA_LOCATION, url).removeHeader(HEADERS.INERTIA_HEADER);
    }

    if (isInertia) {
      response.header(HEADERS.INERTIA_HEADER, 'true');
      return data;
    }

    return this.ctx.view.render(view, { data });
  }

  /**
   * Get current asset version
   */
  private async resolveVersion(): Promise<VersionValue> {
    const { currentVersion } = Inertia;

    if (!currentVersion) {
      return undefined;
    }

    if (typeof currentVersion !== 'function') {
      return currentVersion;
    }

    return await currentVersion();
  }

  public redirectBack() {
    const { response } = this.ctx;

    response.status(303).redirect().back();
  }
}
