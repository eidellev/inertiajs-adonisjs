# Inertia.js AdonisJS Adapter

## Installation

```shell
# NPM
npm i @eidellev/inertia-adonisjs

# Yarn
yarn add @eidellev/inertia-adonisjs
```

## Usage

### Registering Types

Open your `tsconfig.json` file and add `@eidellev/inertia-adonisjs` to `compilerOptions.types`:

```json
{
  "include": ["**/*"],
  "exclude": [...],
  "extends": "./node_modules/adonis-preset-ts/tsconfig",
  "compilerOptions": {
    ...
    },
    "types": [
      "@adonisjs/core",
      "@adonisjs/session",
      "@adonisjs/view",
      "@adonisjs/lucid",
      "@eidellev/inertia-adonisjs" // Add this line
    ]
  }
}

```

### Registering Provider

Open `.adonisrc` and add `@eidellev/inertia-adonisjs` to the list of providers:

```json
...
"providers": [
    "./providers/AppProvider",
    "@adonisjs/core",
    "@adonisjs/session",
    "@adonisjs/view",
    "@adonisjs/lucid",
    "@eidellev/inertia-adonisjs"
  ],
...
```

### Setting Up View

You can set up the inertia root `div` using the `@inertia` tag:

```blade
<body>
  @inertia()
</body>
```

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

In order to add shared props, add the following preloaded file to `start` directory:

```typescript
// /start/inertia.ts

import Inertia from '@ioc:EidelLev/Inertia';

Inertia.share({
  errors: (ctx) => {
    return ctx.session.flashMessages.get('errors');
  },
});
```

## Configuration

By default, `inertia-adonisjs` uses `app.edge` as its view. If you need to change this, add the following to `/config/app.ts`:

```typescript
import { InertiaConfig } from '@ioc:EidelLev/Inertia';
...
/*
|--------------------------------------------------------------------------
| Application secret key

export const inertia: InertiaConfig = {
  view: 'main',
};
...
```
