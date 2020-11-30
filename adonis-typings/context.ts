declare module '@ioc:Adonis/Core/HttpContext' {
  import { InertiaContract } from '@ioc:EidelLev/Inertia';

  interface HttpContextContract {
    /**
     * InertiaJs
     */
    inertia: InertiaContract;
  }
}
