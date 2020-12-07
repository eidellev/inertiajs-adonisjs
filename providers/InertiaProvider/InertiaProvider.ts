import { IocContract } from '@adonisjs/fold';
import { Inertia } from '../../src/Inertia';
import he from 'he';

/*
|--------------------------------------------------------------------------
| Inertia Provider
|--------------------------------------------------------------------------
*/
export default class InertiaProvider {
  constructor(protected container: IocContract) {}

  public boot(): void {
    /**
     * Hook Inertia into ctx during request cycle.
     */
    this.container.with(
      ['Adonis/Core/HttpContext', 'Adonis/Core/View', 'Adonis/Core/Config'],
      (HttpContext, View, Config) => {
        // Register Inertia 'middleware'
        HttpContext.getter(
          'inertia',
          function inertia() {
            return new Inertia(this, Config);
          },
          false,
        );

        // Register inertia view global helper
        View.global('inertia', (data: Record<string, unknown>) => {
          return `<div id="app" data-page="${he.escape(JSON.stringify(data))}"></div>`;
        });
      },
    );
  }
}
