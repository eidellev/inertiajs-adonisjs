import { ApplicationContract } from '@ioc:Adonis/Core/Application';
import { Inertia } from '../../src/Inertia';
import he from 'he';

/*
|--------------------------------------------------------------------------
| Inertia Provider
|--------------------------------------------------------------------------
*/
export default class InertiaProvider {
  constructor(protected app: ApplicationContract) {}
  public static needsApplication = true;

  public boot(): void {
    /**
     * Hook Inertia into ctx during request cycle.
     */
    this.app.container.with(
      ['Adonis/Core/HttpContext', 'Adonis/Core/View', 'Adonis/Core/Config'],
      (HttpContext, View, Config) => {
        const config = Config.get('app.inertia', { view: 'app' });
        /**
         * Hook inertia into ctx during request cycle.
         */
        HttpContext.getter(
          'inertia',
          function inertia() {
            return new Inertia(this, config);
          },
          true,
        );

        // Register inertia view global helper
        View.global('inertia', (data: Record<string, unknown>) => {
          return `<div id="app" data-page="${he.escape(JSON.stringify(data))}"></div>`;
        });
      },
    );
  }
}
