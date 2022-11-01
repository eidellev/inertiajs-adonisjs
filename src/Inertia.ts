import { ApplicationContract } from '@ioc:Adonis/Core/Application';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import {
  InertiaConfig,
  InertiaContract,
  RenderResponse,
  ResponseProps,
  SharedData,
  Version,
  VersionValue,
  SsrRenderResult,
} from '@ioc:EidelLev/Inertia';
import { readFile } from 'fs/promises';
import md5 from 'md5';
import { encode } from 'querystring';
import { HEADERS } from './utils';

export class Inertia implements InertiaContract {
  private static sharedData: SharedData = {};
  private static currentVersion: Version;

  constructor(private app: ApplicationContract, private ctx: HttpContextContract, private config: InertiaConfig) {}

  public static share(data: SharedData) {
    Inertia.sharedData = { ...Inertia.sharedData, ...data };
    return Inertia;
  }

  public static async manifestFile(path: string) {
    try {
      const buffer = await readFile(path);

      return md5(buffer);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('Manifest file could not be read');
      return '';
    }
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
    const { view: inertiaView, ssr = { enabled: false } } = this.config;
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
    const disallowSsr = ssr?.allowList && !ssr.allowList.includes(component);

    // Get asset version
    const version = await this.resolveVersion();
    const isGet = request.method() === 'GET';
    const queryParams = request.all();
    let url = request.url();

    if (isGet && Object.keys(queryParams).length) {
      // Keep original request query params
      url += `?${encode(queryParams)}`;
    }

    const page = {
      component,
      version,
      props,
      url,
    };

    const assetsChanged = requestAssetVersion && requestAssetVersion !== version;

    // Handle asset version update
    if (isInertia && isGet && assetsChanged) {
      session.responseFlashMessages = session.flashMessages;
      await session.commit();
      return response.status(409).header(HEADERS.INERTIA_LOCATION, url);
    }

    // JSON response
    if (isInertia) {
      return page;
    }

    // Initial page render in SSR mode
    if (ssr.enabled && !disallowSsr) {
      const { head, body } = await this.renderSsrPage(page);

      return view.render(inertiaView, {
        page: {
          ssrHead: head,
          ssrBody: body,
        },
        ...pageOnlyProps,
      });
    }

    // Initial page render in CSR mode
    return view.render(inertiaView, { page, ...pageOnlyProps });
  }

  private renderSsrPage(page: any): Promise<SsrRenderResult> {
    const { ssr = { buildDirectory: undefined } } = this.config;
    const { buildDirectory } = ssr;
    const path = buildDirectory || 'inertia/ssr';

    const render = require(this.app.makePath(path, 'ssr.js')).default;

    return render(page);
  }

  /**
   * Converts partial data header to an array of values
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

  /**
   * Simply replace with Adonis' `response.redirect().withQs().back()`
   */
  public redirectBack() {
    const { response } = this.ctx;

    response.status(303).redirect().withQs().back();
  }

  /**
   * Server initiated external redirect
   *
   * @param      {string}  url     The external URL
   */
  public location(url: string) {
    const { response } = this.ctx;

    response.removeHeader(HEADERS.INERTIA_HEADER).header(HEADERS.INERTIA_LOCATION, url).conflict();
  }
}
