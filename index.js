const { spawn } = require('child_process');
const bs = require('browser-sync');

class ShopifyThemeSyncPlugin {
  constructor(options = {}) {
    this.bsInstance = bs.create();
    this.watchedDirs = [
      'assets/*',
      'config/*',
      'layout/*',
      'locales/*',
      'sections/*',
      'snippets/*',
      'templates/*',
      'templates/customers/*',
    ];
    this.storeUrl = options.storeUrl;
    this.env = options.env || 'development';
    this.delay = options.delay || 2000;
    this.port = options.port || 3000;
    this.bsOptions = options.browsersync || {};

    if (!Boolean(this.storeUrl) || typeof this.storeUrl !== 'string') {
      throw new Error(
        "Store URL must be provided, e.g. { storeUrl: 'https://...' }"
      );
    }

    /* 
    If the store url points to a shared preview link (via shopifypreview.com) then
    disable the previewBarInjector and insert Browsersync's snippet immediately after.
    This is because Shopify's iframe does not play nicely when it's being proxied.
    */

    this.snippetRule = this.storeUrl.includes('shopifypreview.com')
      ? {
          match: /previewBarInjector.init\(\);\n}\);<\/script>/i,
          fn: (snippet, match) => `
//previewBarInjector.init();
console.log("Shopify\'s Preview Bar has been disabled by shopify-theme-sync-plugin");
});
</script>
${snippet}`,
        }
      : {
          match: /<\/body>/i,
          fn: (snippet, match) => snippet + match,
        };
  }

  deployFile = (file) => {
    process.stdout.write(
      `[\x1b[35m${this.env}\x1b[0m] Deploying \x1b[032m${file}\x1b[0m...\n`
    );

    spawn('theme', ['-e', this.env, 'deploy', file], {
      shell: true,
      stdio: 'inherit',
    }).on('close', (code) => {
      if (code === 0) {
        this.bsInstance.reload();
      } else {
        console.error('theme exited with code', code);
      }
    });
  };

  removeFile = (file) => {
    process.stdout.write(
      `[\x1b[35m${this.env}\x1b[0m] Removing \x1b[032m${file}\x1b[0m...\n`
    );
    spawn('theme', ['-e', this.env, 'remove', file], {
      shell: true,
      stdio: 'inherit',
    });
  };

  start = (compiler, callback) => {
    if (!this.bsInstance.active) {
      this.bsInstance.init(
        {
          proxy: this.storeUrl,
          port: this.port,
          reloadDelay: this.delay,
          watchEvents: ['change', 'add', 'unlink'],
          snippetOptions: { rule: this.snippetRule },
          files: [
            {
              match: this.watchedDirs,
              fn: (event, file) => {
                switch (event) {
                  case 'change':
                  case 'add':
                    this.deployFile(file);
                    return;
                  case 'unlink':
                    this.removeFile(file);
                    return;
                  default:
                    return;
                }
              },
            },
          ],
          ...this.bsOptions,
        },
        callback
      );
    } else {
      callback();
    }
  };

  apply = (compiler) => {
    compiler.hooks.watchRun.tapAsync(
      'WebpackShopifyThemeSyncPlugin',
      this.start
    );
  };
}

module.exports = ShopifyThemeSyncPlugin;
