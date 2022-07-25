import { BaseCommand } from '@adonisjs/ace';
// import { flags } from '@adonisjs/core/build/standalone';
import { spawn } from 'child_process';

/**
 * Base class to provide helpers for Mix commands
 */
export abstract class BaseSsrCommand extends BaseCommand {
  protected webpackConfig = 'webpack.ssr.config.js';

  protected runScript(script: string, scriptEnv: NodeJS.ProcessEnv) {
    const child = spawn(script, {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, ...scriptEnv },
    });

    child.on('exit', (code, signal) => {
      if (code === null) {
        code = signal === 'SIGINT' ? 130 : 1;
      }

      process.exitCode = code;
    });
  }
}
