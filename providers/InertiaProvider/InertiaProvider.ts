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

  public boot(): void {
    this.app.container.with(
      ['Adonis/Core/HttpContext', 'Adonis/Core/View', 'Adonis/Core/Config'],
      (HttpContext, View, Config) => {
        this.registerInertia(HttpContext, Config);
        this.registerViewGlobal(View);
      },
    );
  }
}
