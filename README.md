# Inertia.js AdonisJS Provider

![](https://img.shields.io/npm/types/typescript?style=for-the-badge)
<a href="https://adonisjs.com/">
<img src="https://img.shields.io/badge/%E2%96%B2%20adonis-v5-5a45ff?style=for-the-badge">
</a>
<a href="https://prettier.io/">
<img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=for-the-badge">
</a>
<a href="">
<a href="https://www.npmjs.com/package/semantic-release">
<img src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=for-the-badge"/>
</a>

[Inertia.js](https://inertiajs.com/) lets you quickly build modern single-page React, Vue and Svelte apps using classic server-side routing and controllers.

[AdonisJS](https://adonisjs.com/) is a fully featured web framework focused on productivity and developer ergonomics.

## Installation

```shell
# NPM
npm i @eidellev/inertia-adonisjs

# or Yarn
yarn add @eidellev/inertia-adonisjs
```

## Setup

You can register the package, generate additional files and install additional depdencies by running:

```shell
node ace configure @eidellev/inertia-adonisjs
```

![Invoke example](invoke.gif 'node ace invoke @eidellev/inertia-adonisjs')

## Making an Inertia Response

```typescript
export default class UsersController {
  public async index({ inertia, request }: HttpContextContract) {
    const users = await User.all();

    return inertia.render('Users/IndexPage', { users });
  }
}
```

## Root template data

There are situations where you may want to access your prop data in your root Edge template. For example, you may want to add a meta description tag, Twitter card meta tags, or Facebook Open Graph meta tags.

```blade
<meta name="twitter:title" content="{{ page.title }}">
```

Sometimes you may even want to provide data that will not be sent to your JavaScript component.

```typescript
return inertia.render('Users/IndexPage', { users }, {  metadata: '...' : '...' });
```

## Shared Data

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

## Route Helper

If you have a page that doesn't need a corresponding controller method, like an FAQ or about page, you can route directly to a component.

```typescript
// /start/routes.ts
import Route from '@ioc:Adonis/Core/Route';

Route.inertia('about', 'About');

// You can also pass root template data as the third parameter:
Route.inertia('about', 'About', { metadata: '...' });
```

## Redirects

### External redirects

Sometimes it's necessary to redirect to an external website, or even another non-Inertia endpoint in your app, within an Inertia request. This is possible using a server-side initiated window.location visit.

```typescript
Route.get('redirect', async ({ inertia }) => {
  inertia.location('https://inertiajs.com/redirects');
});
```

## Advanced

### Asset Versioning

To enable automatic asset refreshing, you simply need to tell Inertia what the current version of your assets is. This can be any string (letters, numbers, or a file hash), as long as it changes when your assets have been updated.

To configure the current asset version, edit `start/inertia.ts`:

```typescript
import Inertia from '@ioc:EidelLev/Inertia';

Inertia.version('v1');

// You can also pass a function that will be lazily evaluated:
Inertia.version(() => 'v2');
```

If you are using Adonis's built-in assets manager [webpack encore](https://docs.adonisjs.com/guides/assets-manager) you can also pass the path to the manifest file to Inertia and the current version will be set automatically:

```typescript
Inertia.version(() => Inertia.manifestFile('public/assets/manifest.json'));
```

### Configuration

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
