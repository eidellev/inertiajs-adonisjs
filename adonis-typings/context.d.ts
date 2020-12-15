declare module '@ioc:Adonis/Core/HttpContext' {
  import { InertiaContract } from '@ioc:EidelLev/Inertia';

  export interface HttpContextContract {
    /**
     * InertiaJs
     */
    inertia: InertiaContract;
  }
}
