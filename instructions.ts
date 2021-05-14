import { join } from 'path';
import * as sinkStatic from '@adonisjs/sink';
import { ApplicationContract } from '@ioc:Adonis/Core/Application';

const ADAPTER_PROMPT_CHOICES = [
  {
    name: '@inertiajs/inertia-vue' as const,
    message: 'Vue 2',
  },
  {
    name: '@inertiajs/inertia-vue3' as const,
    message: 'Vue 3',
  },
  {
    name: '@inertiajs/inertia-react' as const,
    message: 'React',
  },
  {
    name: '@inertiajs/inertia-svelte' as const,
    message: 'Svelte',
  },
];

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
  return sink.getPrompt().ask('Select the view you would like to use', {
    default: 'app',
    validate(view) {
      return !!view.length || 'This cannot be left empty';
    },
  });
}

/**
 * Asks user of they would like to install the client-side inertia library
 */
function getInstallInertiaUserPref(sink: typeof sinkStatic) {
  return sink.getPrompt().confirm('Would you like to install Inertia.js?', {
    default: true,
  });
}

/**
 * Prompts user for their preferred inertia client-side adapter
 */
function getInertiaAdapterPref(sink: typeof sinkStatic) {
  return sink.getPrompt().choice('Which client-side adapter would you like to set up?', ADAPTER_PROMPT_CHOICES, {
    validate(choices) {
      return choices && choices.length ? true : 'Please select an adapter to continue';
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

  const shouldInstallInertia = await getInstallInertiaUserPref(sink);

  if (shouldInstallInertia) {
    const adapter = await getInertiaAdapterPref(sink);

    /**
     * Install required dependencies
     */
    const pkg = new sink.files.PackageJsonFile(projectRoot);
    pkg.install('@inertiajs/inertia', undefined, false);
    pkg.install(adapter, undefined, false);

    /**
     * Find the list of packages we have to remove
     */
    const packages = ['@inertia/inertia', adapter].map((p) => sink.logger.colors.green(p)).join(', ');
    const spinner = sink.logger.await(`Installing ${packages}`);

    try {
      await pkg.commitAsync();
      spinner.update('Packages installed');
      sink.logger.success('All done!');
    } catch (error) {
      spinner.update('Unable to install packages');
      sink.logger.fatal(error);
    }

    spinner.stop();
  }

  /**
   * Generate inertia config
   */
  inertiaConfig.overwrite = true;
  inertiaConfig.apply({ view }).commit();

  const configDir = app.directoriesMap.get('config') || 'config';
  sink.logger.action('create').succeeded(`${configDir}/inertia.ts`);

  /**
   * Generate inertia view
   */
  const viewPath = app.viewsPath(`${view}.edge`);
  const inertiaView = new sink.files.MustacheFile(projectRoot, viewPath, getStub('view.txt'));

  inertiaView.overwrite = true;
  inertiaView.apply({ name: app.appName }).commit();
  const viewsDir = app.directoriesMap.get('views');
  sink.logger.action('create').succeeded(`${viewsDir}/${view}.edge`);

  /**
   * Generate inertia preload file
   */
  const preloadedPath = app.startPath(`inertia.ts`);
  const inertiaPreload = new sink.files.MustacheFile(projectRoot, preloadedPath, getStub('start.txt'));

  inertiaPreload.overwrite = true;
  inertiaPreload.apply().commit();
  const preloadsDir = app.directoriesMap.get('start');
  sink.logger.action('create').succeeded(`${preloadsDir}/inertia.ts`);
}
