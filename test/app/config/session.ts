import Env from '@ioc:Adonis/Core/Env';
    import { SessionConfig } from '@ioc:Adonis/Addons/Session';

    const sessionConfig: SessionConfig = {
      driver: 'cookie',
      cookieName: 'test',
      age: '2h',
      cookie: {
        path: '/',
        httpOnly: true,
        sameSite: false,
      },
    }

    export default sessionConfig;