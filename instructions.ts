import { join } from 'path';
import * as sinkStatic from '@adonisjs/sink';
import { ApplicationContract } from '@ioc:Adonis/Core/Application';

const ADAPTER_PROMPT_CHOICES = [
  {
    name: '@inertiajs/vue2' as const,
    message: 'Vue 2',
  },
  {
    name: '@inertiajs/vue3' as const,
    message: 'Vue 3',
  },
  {
    name: '@inertiajs/react' as const,
    message: 'React',
  },
  {
    name: '@inertiajs/svelte' as const,
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
  return sink.getPrompt().ask('Enter the `.edge` view file you would like to use as your root template', {
    default: 'app',
    validate(view) {
      return !!view.length || 'This cannot be left empty';
    },
  });
}

/**
 * Asks user if they wish to enable SSR
 */
function getSsrUserPref(sink: typeof sinkStatic) {
  return sink.getPrompt().confirm('Would you like to use SSR?', {
    default: false,
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
  const shouldEnableSsr = await getSsrUserPref(sink);
  const pkg = new sink.files.PackageJsonFile(projectRoot);
  const adapter = await getInertiaAdapterPref(sink);

  let packagesToInstall;

  if (adapter === '@inertiajs/vue2') {
    packagesToInstall = [
      adapter,
      'vue@2',
      shouldEnableSsr ? 'vue-server-renderer' : false,
      shouldEnableSsr ? 'webpack-node-externals' : false,
    ];
  } else if (adapter === '@inertiajs/vue3') {
    packagesToInstall = [
      adapter,
      'vue',
      shouldEnableSsr ? '@vue/server-renderer' : false,
      shouldEnableSsr ? 'webpack-node-externals' : false,
    ];
  } else if (adapter === '@inertiajs/react') {
    packagesToInstall = [
      adapter,
      'react',
      'react-dom',
      '@types/react',
      '@types/react-dom',
      shouldEnableSsr ? 'webpack-node-externals' : false,
    ];
  } else {
    packagesToInstall = [adapter, 'svelte', shouldEnableSsr ? 'webpack-node-externals' : false];
  }

  packagesToInstall = packagesToInstall.filter(Boolean);

  /**
   * Install required dependencies
   */
  for (const packageToInstall of packagesToInstall) {
    pkg.install(packageToInstall, undefined, false);
  }

  /**
   * Find the list of packages we have to remove
   */
  const packageList = packagesToInstall.map((packageName) => sink.logger.colors.green(packageName)).join(', ');
  const spinner = sink.logger.await(`Installing dependencies: ${packageList}`);

  try {
    await pkg.commitAsync();
    spinner.update('Dependencies installed');
  } catch (error) {
    spinner.update('Unable to install some or all dependencies');
    sink.logger.fatal(error);
  }

  spinner.stop();

  /**
   * Generate inertia config
   */
  inertiaConfig.overwrite = true;
  inertiaConfig.apply({ view, shouldEnableSsr }).commit();

  const configDir = app.directoriesMap.get('config') || 'config';
  sink.logger.action('create').succeeded(`${configDir}/inertia.ts`);

  /**
   * Generate inertia view
   */
  const viewPath = app.viewsPath(`${view}.edge`);
  const inertiaView = new sink.files.MustacheFile(projectRoot, viewPath, getStub('view.txt'));

  inertiaView.overwrite = true;
  inertiaView.apply({ name: app.appName, inertiaHead: shouldEnableSsr ? '@inertiaHead' : undefined }).commit();
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

  /**
   * Generate SSR webpack config
   */
  if (shouldEnableSsr) {
    const webpackSsrConfig = new sink.files.MustacheFile(
      projectRoot,
      'webpack.ssr.config.js',
      getStub('webpack.ssr.config.txt'),
    );

    webpackSsrConfig.overwrite = true;
    webpackSsrConfig.apply().commit();
    sink.logger.action('create').succeeded('webpack.ssr.config.js');
  }
}
