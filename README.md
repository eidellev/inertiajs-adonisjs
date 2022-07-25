# Inertia.js AdonisJS Provider

![Typescript](https://img.shields.io/npm/types/typescript?style=for-the-badge)
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

[Inertia.js](https://inertiajs.com/) lets you quickly build modern single-page
React, Vue and Svelte apps using classic server-side routing and controllers.

[AdonisJS](https://adonisjs.com/) is a fully featured web framework focused on
productivity and developer ergonomics.

## Installation

```shell
# NPM
npm i @eidellev/inertia-adonisjs

# or Yarn
yarn add @eidellev/inertia-adonisjs
```

## Required AdonisJS Libraries

This library depends on two `AdonisJS` core libraries: `@adonisjs/view` and `@adonisjs/session`.
If you started off with the `api` or `slim` project structure you will need to
install these separately:

```shell
# NPM
npm i @adonisjs/view
npm i @adonisjs/session

# or Yarn
yarn add @adonisjs/view
yarn add @adonisjs/session

# Additionally, you will need to configure the packages:
node ace configure @adonisjs/view
node ace configure @adonisjs/session
```

## Setup

You can register the package, generate additional files and install additional
dependencies by running:

```shell
node ace configure @eidellev/inertia-adonisjs
```

### Register Inertia Middleware

Add Inertia middleware to `start/kernel.ts`:

```typescript
Server.middleware.register([
  () => import('@ioc:Adonis/Core/BodyParser'),
  () => import('@ioc:EidelLev/Inertia/Middleware'),
]);
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

There are situations where you may want to access your prop data in your root
Edge template. For example, you may want to add a meta description tag,
Twitter card meta tags, or Facebook Open Graph meta tags.

```blade
<meta name="twitter:title" content="{{ page.title }}">
```

Sometimes you may even want to provide data that will not be sent to your
JavaScript component.

```typescript
return inertia.render('Users/IndexPage', { users }, {  metadata: '...' : '...' });
```

## Shared Data

Sometimes you need to access certain data on numerous pages within your
application. For example, a common use-case for this is showing the current user
in the site header. Passing this data manually in each response isn't practical.
In these situations shared data can be useful.

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

If you have a page that doesn't need a corresponding controller method, like an
FAQ or about page, you can route directly to a component.

```typescript
// /start/routes.ts
import Route from '@ioc:Adonis/Core/Route';

Route.inertia('about', 'About');

// You can also pass root template data as the third parameter:
Route.inertia('about', 'About', { metadata: '...' });
```

## Redirects

### External redirects

Sometimes it's necessary to redirect to an external website, or even another
non-Inertia endpoint in your app, within an Inertia request.
This is possible using a server-side initiated window.location visit.

```typescript
Route.get('redirect', async ({ inertia }) => {
  inertia.location('https://inertiajs.com/redirects');
});
```

## Advanced

### Server-side rendering

When Inertia detects that it's running in a Node.js environment,
it will automatically render the provided page object to HTML and return it.

#### Setting up server side rendering

> 👷 Currently SSR is supported only for react

Edit the Inertia config file and add the following:

```typescript
// config/inertia.ts

import { InertiaConfig } from '@ioc:EidelLev/Inertia';

/*
|--------------------------------------------------------------------------
| Inertia-AdonisJS config
|--------------------------------------------------------------------------
|
*/

export const inertia: InertiaConfig = {
  view: 'app',
  ssr: {
    enabled: true,
    mode: 'react', // can also be 'vue2', 'vue3', 'svelte'
    pageRootDir: 'js/Pages', // Where inertia should look for page components
  },
};
```

**NOTE**: This will only work if you add `"jsx": "react"` in adonis'
tsconfig inside `compilerOptions`

Edit the inertia view file and add the `inertiaHead` tag to the `head`
section of the page

```blade
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/png" href="/favicon.ico">

  @entryPointStyles('app')
  @entryPointScripts('app')

  @inertiaHead
  <title>Inertia App</title>
</head>
<body>
  @inertia
</body>
</html>
```

### Authentication

AdonisJS provides us with powerful authentication and authorization APIs through
`@adonisjs/auth`. After installing and setting up `@adonisjs/auth` you will need
to set up exception handling to make it work with Inertia.

First, let's use `@adonisjs/auth` in our controller to authenticate the user:

```typescript
// app/Controllers/Http/AuthController.ts
public async login({ auth, request, response }: HttpContextContract) {
  const loginSchema = schema.create({
    email: schema.string({ trim: true }, [rules.email()]),
    password: schema.string(),
  });

  const { email, password } = await request.validate({
    schema: loginSchema,
    messages: {
      required: 'This field is required',
      email: 'Please enter a valid email',
    },
  });

  await auth.use('web').attempt(email, password);

  response.redirect('/');
}

```

By default, AdonisJS will send an HTTP 400 response, which inertia does not know
how to handle. Therefore, we will intercept this exception and redirect back to
our login page (we can also optionally preserve the error message with flash messages).

```typescript
// app/Exceptions/Handler.ts

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler';
import Logger from '@ioc:Adonis/Core/Logger';

export default class ExceptionHandler extends HttpExceptionHandler {
  protected statusPages = {
    '403': 'errors/unauthorized',
    '404': 'errors/not-found',
    '500..599': 'errors/server-error',
  };

  constructor() {
    super(Logger);
  }

  public async handle(error: any, ctx: HttpContextContract) {
    const { session, response } = ctx;

    /**
     * Handle failed authentication attempt
     */
    if (['E_INVALID_AUTH_PASSWORD', 'E_INVALID_AUTH_UID'].includes(error.code)) {
      session.flash('errors', { login: error.message });
      return response.redirect('/login');
    }

    /**
     * Forward rest of the exceptions to the parent class
     */
    return super.handle(error, ctx);
  }
}
```

### Asset Versioning

To enable automatic asset refreshing, you simply need to tell Inertia what the
current version of your assets is. This can be any string
(letters, numbers, or a file hash), as long as it changes
when your assets have been updated.

To configure the current asset version, edit `start/inertia.ts`:

```typescript
import Inertia from '@ioc:EidelLev/Inertia';

Inertia.version('v1');

// You can also pass a function that will be lazily evaluated:
Inertia.version(() => 'v2');
```

If you are using Adonis's built-in assets manager [webpack encore](https://docs.adonisjs.com/guides/assets-manager)
you can also pass the path to the manifest file to Inertia and the current
version will be set automatically:

```typescript
Inertia.version(() => Inertia.manifestFile('public/assets/manifest.json'));
```

### Configuration

The configuration for `inertia-adonisjs` is set in `/config/inertia.ts`:

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
  @inertia
</body>
```

## Contributing

This project happily accepts contributions.

### Getting Started

After cloning the project run

```shell
npm ci
npx husky install # This sets up the project's git hooks
```

### Before Making a Commit

This project adheres to the [semantic versioning](https://semver.org/) convention,
therefore all commits must be [conventional](https://github.com/conventional-changelog/commitlint).

After staging your changes using `git add`, you can use the `commitlint CLI`
to write your commit message:

```shell
npx commit
```

### Before Opening a Pull Request

- Make sure you add tests that cover your changes
- Make sure all tests pass:

```shell
npm test
```

- Make sure eslint passes:

```shell
npm run lint
```

- Make sure your commit message is valid:

```shell
npx commitlint --edit
```

**Thank you to all the people who already contributed to this project!**

## Issues

If you have a question or found a bug, feel free to [open an issue](https://github.com/eidellev/inertiajs-adonisjs/issues).
