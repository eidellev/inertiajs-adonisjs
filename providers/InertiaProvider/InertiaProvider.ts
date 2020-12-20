import he from 'he';
import { ApplicationContract } from '@ioc:Adonis/Core/Application';
import { HttpContextConstructorContract } from '@ioc:Adonis/Core/HttpContext';
import { ViewContract } from '@ioc:Adonis/Core/View';
import { ConfigContract } from '@ioc:Adonis/Core/Config';
import { Inertia } from '../../src/Inertia';

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
    View.global('inertia', (data: Record<string, unknown>) => {
      return `<div id="app" data-page="${he.escape(JSON.stringify(data))}"></div>`;
    });
  }

  private registerInertiaTag(View: ViewContract) {
    View.registerTag({
      block: false,
      tagName: 'inertia',
      seekable: true,
      compile(parser, buffer, token) {
        function parseJsArg(parser, token) {
          return parser.utils.transformAst(
            parser.utils.generateAST(token.properties.jsArg, token.loc, token.filename),
            token.filename,
            parser,
          );
        }

        const parsed = parseJsArg(parser, token);
        buffer.writeExpression(
          `\n
          out += template.sharedState.inertia(${parser.utils.stringify(parsed)})
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
    const config = Config.get('app.inertia', { view: 'app' });

    HttpContext.getter(
      'inertia',
      function inertia() {
        return new Inertia(this, config);
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
    }));
  }

  public boot(): void {
    this.app.container.with(
      ['Adonis/Core/HttpContext', 'Adonis/Core/View', 'Adonis/Core/Config'],
      (HttpContext, View, Config) => {
        this.registerInertia(HttpContext, Config);
        this.registerViewGlobal(View);
        this.registerInertiaTag(View);
        this.registerBinding();
      },
    );
  }
}
