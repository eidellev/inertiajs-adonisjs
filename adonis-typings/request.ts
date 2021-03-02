declare module '@ioc:Adonis/Core/Request' {
  interface RequestContract {
    /**
     * Returns `true` if this reuqest was made by an inertia app
     */
    inertia: () => boolean;
  }
}
