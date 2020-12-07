declare module '@ioc:Adonis/Core/Config' {
  import { In } from '@ioc:EidelLev/Inertia';

  interface ConfigContract {
    /**
     * InertiaJs
     */
    inertia: InertiaContract;
  }
}
