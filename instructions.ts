import { join } from 'path';
import * as sinkStatic from '@adonisjs/sink';
import { ApplicationContract } from '@ioc:Adonis/Core/Application';

/**
 * Returns absolute path to the stub relative from the templates
 * directory
 */
function getStub(...relativePaths: string[]) {
  return join(__dirname, 'templates', ...relativePaths);
}

/**
 * Prompts user for view file they wish to use
 */
function getView(sink: typeof sinkStatic) {
  return sink.getPrompt().ask('Select the view you want to use', {
    default: 'app',
    validate(view) {
      return !!view.length || 'This cannot be left empty';
    },
  });
}

/**
 * Instructions to be executed when setting up the package.
 */
export default async function instructions(projectRoot: string, app: ApplicationContract, sink: typeof sinkStatic) {
  const configPath = app.configPath('inertia.ts');
  const inertiaConfig = new sink.files.MustacheFile(projectRoot, configPath, getStub('inertia.txt'));

  const view = await getView(sink);

  inertiaConfig.overwrite = true;
  inertiaConfig.apply({ view }).commit();

  const configDir = app.directoriesMap.get('config') || 'config';
  sink.logger.action('create').succeeded(`${configDir}/inertia.ts`);

  const viewPath = app.viewsPath(`${view}.edge`);
  const inertiaView = new sink.files.MustacheFile(projectRoot, viewPath, getStub('view.txt'));

  inertiaView.overwrite = true;
  inertiaView.apply({ name: app.appName }).commit();
  const viewsDir = app.directoriesMap.get('views');
  sink.logger.action('create').succeeded(`${viewsDir}/${view}.edge`);
}
