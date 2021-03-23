# Inertia.js AdonisJS Provider

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

### Shared Data

Sometimes you need to access certain data on numerous pages within your application. For example, a common use-case for this is showing the current user in the site header. Passing this data manually in each response isn't practical. In these situations shared data can be useful.

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

### Asset Versioning

To enable automatic asset refreshing, you simply need to tell Inertia what the current version of your assets is. This can be any string (letters, numbers, or a file hash), as long as it changes when your assets have been updated.

To configure the current asset version, edit `start/inertia.ts`:

```typescript
import Inertia from '@ioc:EidelLev/Inertia';

Inertia.version('v1');

// Or as a function:
Inertia.version(() => 'v2');
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
