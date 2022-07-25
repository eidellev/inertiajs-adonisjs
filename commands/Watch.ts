import { existsSync } from 'fs';
import { BaseSsrCommand } from './Base';

/**
 * Command to watch assets
 */
export default class Watch extends BaseSsrCommand {
  public static commandName = 'ssr:watch';
  public static description = 'Build and watch files for changes';
  public static settings = {
    stayAlive: true,
  };

  public async run() {
    const mixConfigPath = this.application.makePath(this.webpackConfig);

    if (!existsSync(mixConfigPath)) {
      this.logger.error(`Webpack configuration file '${this.webpackConfig}' could not be found`);
      return;
    }

    const script: string = 'npx encore dev -c webpack.ssr.config.js -w';

    const scriptEnv = {
      NODE_ENV: 'development',
    };

    this.runScript(script, scriptEnv);
  }
}
