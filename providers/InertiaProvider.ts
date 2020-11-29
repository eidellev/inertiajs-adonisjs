import { IocContract } from '@adonisjs/fold';
import he from 'he';

/*
|--------------------------------------------------------------------------
| Provider
|--------------------------------------------------------------------------
|
| Your application is not ready, when this file is loaded by the framework.
| Hence, the level imports relying on the IoC container will not work.
| You must import them inside the life-cycle methods defined inside
| the provider class.
|
| @example:
|
| public async ready () {
|   const Database = (await import('@ioc:Adonis/Lucid/Database')).default
|   const Event = (await import('@ioc:Adonis/Core/Event')).default
|   Event.on('db:query', Database.prettyPrint)
| }
|
*/
export default class InertiaProvider {
  constructor(protected container: IocContract) {}

  public register() {
    // Register your own bindings
  }

  public async boot() {
    // All bindings are ready, feel free to use them
  }

  public async ready() {
    const View = (await import('@ioc:Adonis/Core/View')).default;

    View.global('inertia', (data: Record<string, unknown>) => {
      return `<div id="app" data-page="${he.escape(JSON.stringify(data))}"></div>`;
    });
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
