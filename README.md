# Inertia.js AdonisJS Adapter

## Installation

```shell
# NPM
npm i @eidellev/inertia-adonisjs

# Yarn
yarn add @eidellev/inertia-adonisjs
```

## Usage

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

Add the following snippet to `app.edge`:

```handlebars
<body>
  {{{ inertia(data) }}}
</body>
```

### Making an Inertia Response

```typescript
export default class UsersController {
  public async index({ inertia, request }: HttpContextContract) {
    const users = await User.all();

    return inertia.render('Studio/Journeys/IndexPage', { users });
  }
}
```

### Handling Redirects

...

### Shared Props

...

## Configuration

By default, `inertia-adonisjs` use `app.edge` as its view. If you need to change this, add the following to `/config/app.ts`:

```typescript
import { InertiaConfig } from '@ioc:EidelLev/Inertia';

/*
|--------------------------------------------------------------------------
| Application secret key

export const inertia: InertiaConfig = {
  view: 'main',
};
...

```
