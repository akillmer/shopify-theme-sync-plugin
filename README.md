# Shopify Theme Sync Plugin

_**NB:** This `webpack` plugin is not officially endorsed, sponsored, or provided by Shopify Inc._

`ShopifyThemeSyncPlugin` helps keep your new theme perfectly in sync with your Shopify store during active development. It uses [Browsersync](https://browsersync.io) to watch for file changes and to provide live reloading. [Shopify's Theme Kit](https://shopify.github.io/themekit/) is used to push these changes directly to your store &mdash; `theme` must be available on your `$PATH` and have [API access to your store](https://shopify.github.io/themekit/#get-api-access).

## Getting Started

```
npm install shopify-theme-sync-plugin --save-dev
```

&mdash; _or_ &mdash;

```
yarn add shopify-theme-sync-plugin --dev
```

Make sure that `theme` from [Shopify's Theme Kit](https://shopify.github.io/themekit/) is available on your `$PATH` and has [access to your store's API](https://shopify.github.io/themekit/#get-api-access).

### webpack.config.js

```javascript
const ShopifyThemeSyncPlugin = require('shopify-theme-sync-plugin');

module.exports = {
  // ...
  plugins: [
    new ShopifyThemeSyncPlugin({
      storeUrl: 'https://[your-store-url]',
    }),
  ],
};
```

### Run `webpack --watch`

You access your store via Browsersync's proxy at `https://localhost:3000` (default). Browsersync's UI can also be accessed at `http://localhost:3001` (default). Any changes you make to the contents of your theme's directories will trigger Browsersync to reload all connected browsers, but only after the changes have been pushed to Shopify via `theme`.

Make sure to configure `webpack` to use `assets/` as its output directory.

## Proxying Shopify Store URLs

The only configuration required is `storeUrl`, so that Browsersync's proxy can function. This plugin's behavior will depend on which of the two acceptable Shopify URLs you provide.

### https://*.myshopify.com

This URL is used to access your _live_ Shopify store. Browsersync's proxy will insert its snippet right before `</body>` (default behavior).

### https://*.shopifypreview.com

It's ideal to [create and use a theme preview link](https://help.shopify.com/en/manual/using-themes/adding-themes#share-a-theme-preview-with-others) for any unpublished theme during development. With this link, however, Shopify will insert an `iframe` for its _Preview Bar_ at the bottom of each page. Due to Browsersync's proxy this _Preview Bar_ will not always function properly, it may even throw errors. In response this plugin will prevent the _Preview Bar_ from initializing and Browsersync's snippet will be inserted into the document's `<head>` instead.

## Watched Directories

`ShopifyThemeSyncPlugin` will only watch directories that Shopify supports for [developing theme templates](https://shopify.dev/tutorials/develop-theme-templates). The plugin will ignore subdirectories, besides `templates/customers`, because Shopify doesn't allow new subdirectories to be created anyway.

These are the directories that are watched:

- `assets`
- `config`
- `layout`
- `locales`
- `sections`
- `snippets`
- `templates`
  - `customers`

## Configuration Options

The only required configuration is `storeUrl` , but you can also pass these configuration options:

|     Name      |    Type    |    Default    | Description                                                                                                                                                                                                                                                               |
| :-----------: | :--------: | :-----------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|  `storeUrl`   | `{String}` |    &mdash;    | Required. Points to your live Shopify store or theme preview.                                                                                                                                                                                                             |
|    `port`     | `{Number}` |    `3000`     | Use a specific port with Browsersync.                                                                                                                                                                                                                                     |
|     `env`     | `{String}` | `development` | Specify which [theme environment](https://shopify.github.io/themekit/commands/#using-environments) you're syncing with.                                                                                                                                                   |
|    `delay`    | `{Number}` |    `2000`     | Time, in milliseconds, before your browser is instructed to reload. A default duration of two seconds should give Shopify enough time to have your new assets available for loading. If the duration is set too low then you will need to manually reload to see changes. |
| `browsersync` | `{Object}` |     `{}`      | Pass along any [Browsersync options](https://www.browsersync.io/docs/option) to be used for its initialization. This will overwrite any configuration options that was provided by the plugin.                                                                            |

Here's an example `webpack` config showing how to use these options:

### webpack.config.js

```javascript
{
  // ...
  plugins: [
    new ShopifyThemeSyncPlugin({
      storeUrl: 'https://some-id.shopifypreview.com',
      port: 8080,
      env: 'production',
      delay: 500,
      browsersync: {
        ui: false,
        logLevel: 'silent',
        ignore: ['*.json'],
      },
    },
  ],
}
```

## Invalid Security Certificates

Your web browser will warn you that your connection is _not secure_ when connecting to Browsersync's proxy over `https`. In most cases you can explicitly proceed without issue. If problems persist, such as not being able to connect over WebSockets to Browsersync, then there's a couple things you can try:

- Change your `storeUrl` from `https://...` to `http://...`
- Configure your browser to allow mixed content from the proxy server
- Explicitly enable `https` with Browsersync: `{ browsersync: { https: true } }`

If you're still having issues then please create a new issue so we can figure it out together.
