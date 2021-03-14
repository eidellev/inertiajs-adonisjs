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

export const inertia: InertiaConfig = {
  view: 'app',
};
```

## Setting Up View

You can set up the inertia root div in your view using the @inertia tag:

```blade
<body>
  @inertia()
</body>
```
