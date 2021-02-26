# Inertia.js AdonisJS Adapter

## Installation

```shell
# NPM
npm i @eidellev/inertia-adonisjs

# or Yarn
yarn add @eidellev/inertia-adonisjs

# Register package and generate additional files
node ace invoke @eidellev/inertia-adonisjs
```

## Usage

### Making an Inertia Response

```typescript
export default class UsersController {
  public async index({ inertia, request }: HttpContextContract) {
    const users = await User.all();

    return inertia.render('Users/IndexPage', { users });
  }
}
```

### Handling Validation Errors

To ensure validation errors are handled correctly, you should add the following to the `handle` method of your exception handler:

```typescript
// /app/Exceptions/Handler.ts
import Logger from '@ioc:Adonis/Core/Logger';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler';

export default class ExceptionHandler extends HttpExceptionHandler {
  protected statusPages = {
    '404': 'errors.not-found',
    '500..599': 'errors.server-error',
  };

  public async handle(error: any, ctx: HttpContextContract) {
    const { inertia, session } = ctx;

    this.logger.error(error);

    if (error.code === 'E_VALIDATION_FAILURE' && inertia.isInertia()) {
      session.flash('errors', error);
      return inertia.redirectBack(); // This ensures that the response has the correct HTTP code
    }

    return super.handle(error, ctx);
  }

  constructor() {
    super(Logger);
  }
}
```

### Shared Props

In order to add shared props, edit `start/inertia.ts`:

```typescript
import Inertia from '@ioc:EidelLev/Inertia';

Inertia.share({
  errors: (ctx) => {
    return ctx.session.flashMessages.get('errors');
  },
  // Add more shared props here
});
```

## Configuration

The configuration for `inertia-adonisjs` is set in `/config/app.ts`:

```typescript
import { InertiaConfig } from '@ioc:EidelLev/Inertia';
...

export const inertia: InertiaConfig = {
  view: 'app',
};
```
