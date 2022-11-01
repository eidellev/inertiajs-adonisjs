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

## What is this all about?

[Inertia.js](https://inertiajs.com/) lets you quickly build modern single-page
React, Vue and Svelte apps using classic server-side routing and controllers.

[AdonisJS](https://adonisjs.com/) is a fully featured web framework focused on
productivity and developer ergonomics.

### Project goals

- Feature parity with the official Inertia backend adapters
- Full compatibility with all official client-side adapters
- Easy setup
- Quality documentation

## Installation

```shell
# NPM
npm i @eidellev/inertia-adonisjs

# or Yarn
yarn add @eidellev/inertia-adonisjs
```

## Required AdonisJS libraries

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

Inertia will query you on your preferences (e.g. which front-end framework you
prefer and if you want server side rendering) and generate additional files.

![Invoke example](invoke.gif 'node ace invoke @eidellev/inertia-adonisjs')

### Configuration

The configuration for `inertia-adonisjs` is set in `/config/inertia.ts`:

```typescript
import { InertiaConfig } from '@ioc:EidelLev/Inertia';

export const inertia: InertiaConfig = {
  view: 'app',
};
```

### Register inertia middleware

Add Inertia middleware to `start/kernel.ts`:

```typescript
Server.middleware.register([
  () => import('@ioc:Adonis/Core/BodyParser'),
  () => import('@ioc:EidelLev/Inertia/Middleware'),
]);
```

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

## Shared data

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

### Sharing route params

Traditionally in Adonis, we have access to the context instance eg. params
inside view (.edge) that we can use to help build our dynamic routes.
But with inertia, we lose access to the context instance entirely.

We can overcome this limitation by passing the context
instance as a shared data prop:

```typescript
// start/inertia.ts
import Inertia from '@ioc:EidelLev/Inertia';

Inertia.share({
  params: ({ params }) => params,
});
```

Then we can access the params in our component like so:

```typescript
import { usePage } from '@inertiajs/inertia-react';

const { params } = usePage().props;
stardust.route('users.show', { id: params.id });
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

After configuring the the package using `ace configure` and enabling SSR,
you will need to edit `webpack.ssr.config.js`.
Set it up as you have your regular encore config to
support your client-side framework of choice.

#### Adding an additional entrypoint

Create a new entrypoint `resources/js/ssr.js` (or `ssr.ts`/`ssr.tsx`
if you prefer to use Typescript).

Yous entrypoint code will depend on your client-side framework of choice:

##### React

```jsx
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { createInertiaApp } from '@inertiajs/inertia-react';

export default function render(page) {
  return createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: (name) => require(`./Pages/${name}`),
    setup: ({ App, props }) => <App {...props} />,
  });
}
```

##### Vue3

```javascript
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { createInertiaApp } from '@inertiajs/inertia-vue3';

export default function render(page) {
  return createInertiaApp({
    page,
    render: renderToString,
    resolve: (name) => require(`./Pages/${name}`),
    setup({ app, props, plugin }) {
      return createSSRApp({
        render: () => h(app, props),
      }).use(plugin);
    },
  });
}
```

##### Vue2

```javascript
import Vue from 'vue';
import { createRenderer } from 'vue-server-renderer';
import { createInertiaApp } from '@inertiajs/inertia-vue';

export default function render(page) {
  return createInertiaApp({
    page,
    render: createRenderer().renderToString,
    resolve: (name) => require(`./Pages/${name}`),
    setup({ app, props, plugin }) {
      Vue.use(plugin);
      return new Vue({
        render: (h) => h(app, props),
      });
    },
  });
}
```

##### Svelte

> 👷 SSR is not yet ready for the Svelte adapter,
> but will added as soon as Inertia supports it.

#### Starting the SSR dev server

In a separate terminal run encore for SSR in watch mode:

```shell
node ace ssr:watch
```

#### Building SSR for production

```shell
node ace ssr:build
```

> ❗In most cases you do not want the compiled javascript for ssr committed
> to source control.
> To avoid it, please add the `inertia` directory to `.gitignore`.

#### Customizing SSR output directory

By default, SSR assets will be emitted to `inertia/ssr` directory. If you
prefer to use a different directory, you can change it by setting the
`buildDirectory` parameter:

```typescript
// /config/inertia.ts
{
  ssr: {
    enabled:true,
    buildDirectory: 'custom_path/ssr'
  }
}
```

**You will also need to configure your SSR webpack config to output files to
the same path.**

#### Opting Out of SSR

Building isomorphic apps often comes with additional complexity.
In some cases you may prefer to render only certain public routes on the
server while letting the rest be rendered on the client.
Luckily you can easily opt out of SSR by configuring a list of components that
will rendered on the server, excluding all other components.

```typescript
{
  ssr: {
    enabled:true,
    allowList: ['HomePage', 'Login']
  }
}
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
