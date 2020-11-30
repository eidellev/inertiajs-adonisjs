/*
|--------------------------------------------------------------------------
| Preloaded File
|--------------------------------------------------------------------------
|
| Any code written inside this file will be executed during the application
| boot.
|
*/

import Inertia from '../src/Inertia';

Inertia.share({
  errors: ({ ctx }) => {
    return ctx?.session?.flashMessages.get('errors');
  },
});
