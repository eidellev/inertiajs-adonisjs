import { InertiaLazyProp, ResponseProps } from '@ioc:EidelLev/Inertia';

export default class LazyProp implements InertiaLazyProp {
  constructor(protected lazyPropCallback: () => ResponseProps | Promise<ResponseProps>) {}

  public get lazyValue(): ResponseProps | Promise<ResponseProps> {
    return this.lazyPropCallback()
  }
}
