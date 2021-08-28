import { SessionConfig } from '@ioc:Adonis/Addons/Session';

const sessionConfig: SessionConfig = {
  clearWithBrowser: true,
  driver: 'cookie',
  cookieName: 'test',
  age: '2h',
  cookie: {
    path: '/',
    httpOnly: true,
    sameSite: false,
  },
};

export default sessionConfig;
