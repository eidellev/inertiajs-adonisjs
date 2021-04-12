import {
  ResponseProps,
  InertiaConfig,
  InertiaContract,
  SharedData,
  Version,
  VersionValue,
  RenderResponse,
} from '@ioc:EidelLev/Inertia';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
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
    responseProps: ResponseProps = {},
    pageOnlyProps: ResponseProps = {},
  ): RenderResponse {
    const { view: inertiaView } = this.config;
    const { request, response, view, session } = this.ctx;
    const isInertia = request.inertia();
    const partialData = this.resolvePartialData(request.header(HEADERS.INERTIA_PARTIAL_DATA));
    const partialDataComponentHeader = request.header(HEADERS.INERTIA_PARTIAL_DATA_COMPONENT);
    const requestAssetVersion = request.header(HEADERS.INERTIA_VERSION);
    const props: ResponseProps = await this.resolveProps(
      { ...Inertia.sharedData, ...responseProps },
      partialData,
      component,
      partialDataComponentHeader,
    );

    // Get asset version
    const version = await this.resolveVersion();
    // Keep original request query params
    const queryParams = new URLSearchParams(request.all()).toString();
    const url = `${request.url()}${queryParams && `?${queryParams}`}`;
    const page = {
      component,
      version,
      props,
      url,
    };

    const isGet = request.method() === 'GET';
    const assetsChanged = requestAssetVersion && requestAssetVersion !== version;

    // Handle asset version update
    if (isInertia && isGet && assetsChanged) {
      session.responseFlashMessages = session.flashMessages;
      await session.commit();
      return response.status(409).header(HEADERS.INERTIA_LOCATION, url);
    }

    response.header(HEADERS.INERTIA_HEADER, 'true');

    // JSON response
    if (isInertia) {
      return page;
    }

    // Initial page render
    return view.render(inertiaView, { page, ...pageOnlyProps });
  }

  /**
   * Convertes partial data header to an array of values
   */
  private resolvePartialData(partialDataHeader?: string): string[] {
    return (partialDataHeader || '').split(',').filter(Boolean);
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

  /**
   * Resolves all response prop values
   */
  private async resolveProps(
    props: ResponseProps,
    partialData: string[],
    component: string,
    partialDataComponentHeader?: string,
  ) {
    // Keep only partial data
    if (partialData.length && component === partialDataComponentHeader) {
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
    return Object.fromEntries(result);
  }

  public redirectBack() {
    const { response } = this.ctx;

    response.status(303).redirect().back();
  }

  /**
   * Server initiated external redirect
   *
   * @param      {string}  url     The external URL
   */
  public location(url: string) {
    const { response } = this.ctx;

    response.header(HEADERS.INERTIA_LOCATION, url).conflict();
  }
}
