import { ResponseProps } from '@ioc:EidelLev/Inertia';

declare module '@ioc:Adonis/Core/Route' {
  interface RouterContract {
    /**
     * Inertia route helper
     *
     * @param      {string}         pattern        Path
     * @param      {string}         component      The component you'd like inertia to render
     * @param      {ResponseProps}  pageOnlyProps  View metadata that will be passed only to the edge view
     * @return     {RouteContract}
     */
    inertia: (pattern: string, component: string, pageOnlyProps: ResponseProps) => RouterContract;
  }
}
