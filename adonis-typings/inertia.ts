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

  export interface InertiaLazyProp {
    lazyValue: ResponseProps | Promise<ResponseProps>;
  }

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

    /**
     * Initiate a server-side redirect to an external resource
     *
     * See https://inertiajs.com/redirects
     */
    location(url: string): void;
  }

  export interface InertiaConfig {
    /**
     * Which view template to render
     */
    view: string;
    /**
     * SSR config
     */
    ssr?: {
      enabled: boolean;
      /**
       * Programaticaly control which page components are rendered server-side<br/>
       * All other components will only be rendered on the client<br/>
       * This can be useful if you wish to avoid some of the complexities of building an isomorphic app<br/>
       *
       * @example
       * ```typescript
       * {
       *    ssr: {
       *        enabled:true,
       *        allowList: ['HomePage', 'Login']
       *    }
       * }
       * ```
       *
       */
      allowList?: string[];
      /**
       * Controls SSR build output directory
       *
       * **If you change this you will also need to change the output directory in your webpack encore config!**
       * @default './inertia/ssr'
       */
      buildDirectory?: string;

      /**
       * Controls SSR autoreloading when content is changed.
       *
       * This should be set to true only during development. In production, you should set this to false for
       * performance reasons.
       * @default false
       */
      autoreload?: boolean;
    };
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

    /**
     * Lazy prop (not loaded until explicitly requested)
     */
    lazy(lazyPropCallback: () => ResponseProps | Promise<ResponseProps>): InertiaLazyProp;
  }

  export interface SsrRenderResult {
    head: string[];
    body: string;
  }

  const Inertia: InertiaGlobal;

  export default Inertia;
}
