declare module '@ioc:EidelLev/Inertia' {
  import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

  export type ResponseProps = Record<string, unknown>;
  export type LazyShareResponse = Record<string, string | number | object | boolean>;
  export type LazyShare = (ctx: HttpContextContract) => LazyShareResponse | Promise<LazyShareResponse>;
  export type SharedData = Record<string, string | number | object | boolean | LazyShare>;

  export interface InertiaContract {
    /**
     * Render inertia response
     *
     * @param      {string}         component      Page component
     * @param      {ResponseProps}  responseProps  Props
     */
    render(component: string, responseProps?: ResponseProps): Promise<Record<string, unknown> | string>;

    /**
     * Determines if inertia request
     *
     * @return     {boolean}  True if inertia, False otherwise.
     */
    isInertia(): boolean;

    /**
     * Redirect back with the correct HTTP status code
     */
    redirectBack(): void;
  }

  export interface InertiaConfig {
    view: string;
  }

  interface InertiaGlobal {
    share: (data: SharedData) => void;
  }

  const Inertia: InertiaGlobal;
  export default Inertia;
}
