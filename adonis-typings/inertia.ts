declare module '@ioc:EidelLev/Inertia' {
  import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
  import { ResponseContract } from '@ioc:Adonis/Core/Response';

  export type ResponseProps = Record<string, unknown>;
  export type RenderResponse = Promise<Record<string, unknown> | string | ResponseContract>;

  /**
   * Shared data types
   */
  export type Data = string | number | object | boolean;
  export type LazyShare = (ctx: HttpContextContract) => LazyShareResponse | Promise<LazyShareResponse>;
  export type SharedData = Record<string, Data | LazyShare>;
  export type LazyShareResponse = Record<string, Data>;

  /**
   * Version data types
   */
  export type VersionValue = string | number | undefined;
  export type LazyVersion = () => VersionValue | Promise<VersionValue>;
  export type Version = VersionValue | LazyVersion | undefined;

  export interface InertiaContract {
    /**
     * Render inertia response
     *
     * @param      {string}         component      Page component
     * @param      {ResponseProps}  responseProps  Props
     */
    render(component: string, responseProps?: ResponseProps, pageOnlyProps?: ResponseProps): RenderResponse;

    /**
     * Redirect back with the correct HTTP status code
     */
    redirectBack(): void;
  }

  export interface InertiaConfig {
    view: string;
  }

  interface InertiaGlobal {
    /**
     * Shared props
     */
    share: (data: SharedData) => InertiaGlobal;
    /**
     * Asset tracking
     */
    version: (currentVersion: string | number | LazyVersion) => InertiaGlobal;

    /**
     * Returns md5 hash for manifest file at path
     * Can be used to automatically determine asset version
     * @param path manifest file path
     */
    manifestFile: (path: string) => string;
  }

  const Inertia: InertiaGlobal;
  export default Inertia;
}
