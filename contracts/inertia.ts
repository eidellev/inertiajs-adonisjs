import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export type ResponseProps = Record<string, unknown>;

export type ShareCallback = { ctx: HttpContextContract; component: string; props: Record<string, unknown> };

export interface Inertia {
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
