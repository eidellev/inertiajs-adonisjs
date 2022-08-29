import { Redirect } from '@adonisjs/http-server/build/src/Redirect';
import { ApplicationContract } from '@ioc:Adonis/Core/Application';
import { ConfigContract } from '@ioc:Adonis/Core/Config';
import { HttpContextConstructorContract } from '@ioc:Adonis/Core/HttpContext';
import { RequestConstructorContract, RequestContract } from '@ioc:Adonis/Core/Request';
import { RedirectContract, ResponseConstructorContract } from '@ioc:Adonis/Core/Response';
import { RouterContract } from '@ioc:Adonis/Core/Route';
import Validator, { ErrorReporterConstructorContract } from '@ioc:Adonis/Core/Validator';
import { ViewContract } from '@ioc:Adonis/Core/View';
import { ResponseProps } from '@ioc:EidelLev/Inertia';
import { encode } from 'html-entities';
import { Inertia } from '../../src/Inertia';
import { inertiaHelper } from '../../src/inertiaHelper';
import { HEADERS } from '../../src/utils';
import InertiaMiddleware from '../../middleware/Inertia';

/*
|--------------------------------------------------------------------------
| Inertia Provider
|--------------------------------------------------------------------------
*/
export default class InertiaProvider {
  constructor(protected app: ApplicationContract) {}
  public static needsApplication = true;

  /**
   * Register the `inertia` view global
   */
  private registerInertiaViewGlobal(View: ViewContract) {
    View.global('inertia', (page: Record<string, unknown> = {}) => {
      if (page.ssrBody) {
        return page.ssrBody;
      }

      return `<div id="app" data-page="${encode(JSON.stringify(page))}"></div>`;
    });
  }

  /**
   * Register the `inertiaHead` view global
   */
  private registerInertiaHeadViewGlobal(View: ViewContract) {
    View.global('inertiaHead', (page: Record<string, unknown>) => {
      const { ssrHead = [] }: { ssrHead?: string[] } = page || {};

      return ssrHead.join('\n');
    });
  }

  private registerInertiaTag(View: ViewContract) {
    View.registerTag({
      block: false,
      tagName: 'inertia',
      seekable: false,
      compile(_, buffer, token) {
        buffer.writeExpression(
          `\n
          out += template.sharedState.inertia(state.page)
          `,
          token.filename,
          token.loc.start.line,
        );
      },
    });
  }

  private registerInertiaHeadTag(View: ViewContract) {
    View.registerTag({
      block: false,
      tagName: 'inertiaHead',
      seekable: false,
      compile(_, buffer, token) {
        buffer.writeExpression(
          `\n
          out += template.sharedState.inertiaHead(state.page)
          `,
          token.filename,
          token.loc.start.line,
        );
      },
    });
  }

  /*
   * Hook inertia into ctx during request cycle
   */
  private registerInertia(
    Application: ApplicationContract,
    HttpContext: HttpContextConstructorContract,
    Config: ConfigContract,
  ) {
    const config = Config.get('inertia.inertia', { view: 'app' });

    HttpContext.getter(
      'inertia',
      function inertia() {
        return new Inertia(Application, this, config);
      },
      false,
    );
  }

  /*
   * Register `inertia` helper on request object
   */
  private registerInertiaHelper(request: RequestConstructorContract) {
    request.getter(
      'inertia',
      function inertia() {
        return () => inertiaHelper(this);
      },
      false,
    );
  }

  /**
   * Registers inertia binding
   */
  public registerBinding() {
    this.app.container.bind('EidelLev/Inertia/Middleware', () => InertiaMiddleware);

    this.app.container.singleton('EidelLev/Inertia', () => ({
      share: Inertia.share,
      version: Inertia.version,
      manifestFile: Inertia.manifestFile,
    }));
  }

  /**
   * Registers custom validation negotiator
   * https://preview.adonisjs.com/releases/core/preview-rc-2#validator
   */
  public registerNegotiator({ validator }: typeof Validator) {
    validator.negotiator((request: RequestContract): ErrorReporterConstructorContract => {
      if (request.inertia()) {
        return validator.reporters.vanilla;
      }

      if (request.ajax()) {
        return validator.reporters.api;
      }

      switch (request.accepts(['html', 'application/vnd.api+json', 'json'])) {
        case 'html':
        case null:
          return validator.reporters.vanilla;
        case 'json':
          return validator.reporters.api;
        case 'application/vnd.api+json':
          return validator.reporters.jsonapi;
      }
    });
  }

  /**
   * Registers the Inertia route helper
   */
  public registerRouteHelper(Route: RouterContract): void {
    Route.inertia = (pattern: string, component: string, pageOnlyProps: ResponseProps = {}) => {
      Route.get(pattern, ({ inertia }) => {
        return inertia.render(component, {}, pageOnlyProps);
      });

      return Route;
    };
  }

  /**
   * Set HTTP code 303 after a PUT, PATCH or POST request so the redirect is treated as GET request
   * https://inertiajs.com/redirects#303-response-code
   */
  public registerRedirect(Response: ResponseConstructorContract) {
    Response.macro(
      'redirect',
      function (path?: string, forwardQueryString: boolean = false, statusCode = 302): RedirectContract | void {
        const isInertia = this.request.rawHeaders.includes(HEADERS.INERTIA_HEADER);
        const method = this.request.method;
        let finalStatusCode = statusCode;

        if (isInertia && statusCode === 302 && method && method && ['PUT', 'PATCH', 'DELETE'].includes(method)) {
          finalStatusCode = 303;
        }

        // @ts-ignore
        const handler = new Redirect(this.request, this, this.router);

        if (forwardQueryString) {
          handler.withQs();
        }

        if (path === 'back') {
          return handler.status(finalStatusCode).back();
        }

        if (path) {
          return handler.status(finalStatusCode).toPath(path);
        }

        handler.status(finalStatusCode);

        return handler;
      },
    );
  }

  public boot(): void {
    this.app.container.withBindings(
      [
        'Adonis/Core/HttpContext',
        'Adonis/Core/View',
        'Adonis/Core/Config',
        'Adonis/Core/Request',
        'Adonis/Core/Response',
        'Adonis/Core/Validator',
        'Adonis/Core/Route',
        'Adonis/Core/Application',
      ],
      (HttpContext, View, Config, Request, Response, Validator, Route, Application) => {
        this.registerInertia(Application, HttpContext, Config);
        this.registerInertiaViewGlobal(View);
        this.registerInertiaHeadViewGlobal(View);
        this.registerInertiaTag(View);
        this.registerInertiaHeadTag(View);
        this.registerInertiaHelper(Request);
        this.registerRedirect(Response);
        this.registerNegotiator(Validator);
        this.registerBinding();
        this.registerRouteHelper(Route);
      },
    );
  }
}
