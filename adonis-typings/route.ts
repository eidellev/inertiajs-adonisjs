declare module '@ioc:Adonis/Core/Route' {
  interface RouterContract {
    /**
     * Inertia route helper
     *
     * @param      {string}  pattern    Path
     * @param      {string}  component  The you'd like inertia to render
     * @return     {RouteContract}
     */
    inertia: (pattern: string, component: string) => RouterContract;
  }
}
