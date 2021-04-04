import he from 'he';
import { ApplicationContract } from '@ioc:Adonis/Core/Application';
import { HttpContextConstructorContract } from '@ioc:Adonis/Core/HttpContext';
import { RequestContract, RequestConstructorContract } from '@ioc:Adonis/Core/Request';
import { ViewContract } from '@ioc:Adonis/Core/View';
import { ConfigContract } from '@ioc:Adonis/Core/Config';
import Validator, { ErrorReporterConstructorContract } from '@ioc:Adonis/Core/Validator';
import { Inertia } from '../../src/Inertia';
import { inertiaHelper } from '../../src/inertiaHelper';

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
  private registerViewGlobal(View: ViewContract) {
    View.global('inertia', (page: Record<string, unknown>) => {
      return `<div id="app" data-page="${he.escape(JSON.stringify(page))}"></div>`;
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

  /*
   * Hook inertia into ctx during request cycle
   */
  private registerInertia(HttpContext: HttpContextConstructorContract, Config: ConfigContract) {
    const config = Config.get('inertia.inertia', { view: 'app' });

    HttpContext.getter(
      'inertia',
      function inertia() {
        return new Inertia(this, config);
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
    this.app.container.singleton('EidelLev/Inertia', () => ({
      share: Inertia.share,
      version: Inertia.version,
    }));
  }

  /**
   * Registers custom validation negotiator
   * https://preview.adonisjs.com/releases/core/preview-rc-2#validator
   */
  public registerNegotiator({ validator }: typeof Validator) {
    validator.negotiator(
      (request: RequestContract): ErrorReporterConstructorContract => {
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
      },
    );
  }

  public boot(): void {
    this.app.container.with(
      [
        'Adonis/Core/HttpContext',
        'Adonis/Core/View',
        'Adonis/Core/Config',
        'Adonis/Core/Request',
        'Adonis/Core/Validator',
      ],
      (HttpContext, View, Config, Request, Validator) => {
        this.registerInertia(HttpContext, Config);
        this.registerViewGlobal(View);
        this.registerInertiaTag(View);
        this.registerInertiaHelper(Request);
        this.registerNegotiator(Validator);
        this.registerBinding();
      },
    );
  }
}
