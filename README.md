# Protractor-puppeteer plugin

The main goal of this plugin is to enable the use of two tools in autotests written on Protractor.
Also, this plugin can measure page performance using Lighthouse.

**Chrome only supported.**

## Requirements:

| Protractor-puppeteer plugin | Protractor | Puppeteer | Lighthouse | NodeJS |
|-----------------------------|------------|-----------|------------|--------|
| ^1.0.0                      | ^5.0.0     | ^2.1.0    | -          | ^10    |
| ^2.0.0                      | ^5.0.0     | ^3.0.0    | -          | ^10    |
| ^3.0.0                      | ^5.0.0     | ^4.0.0    | -          | ^10    |
| ^4.0.0                      | ^5.0.0     | ^5.0.0    | -          | ^10    |
| ^5.0.0 (`Current`)          | ^5.0.0     | ^5.2.0    | ^6.3.0     | ^10    |

## How to add this plugin to protractor:

```
// protractor.conf.js

plugins: [{
    package: 'protractor-puppeteer-plugin',
    (or path: require.resolve('protractor-puppeteer-plugin'))
    configFile?: './path/to/puppeteer.conf.json',
    configOptions?: {
        connectToBrowser?: boolean, (Default: false) // This prop allows to connect Puppeteer to Protractor
        connectOptions?: {
            defaultViewport?: {
                width?: number, (Default: 800px)
                height?: number, (Default: 600px)
                deviceScaleFactor?: number, (Default: 1)
                isMobile?: boolean, (Default: false)
                hasTouch?: boolean, (Default: false)
                isLandscape?: boolean (Default: false)
            },
            ignoreHTTPSErrors?: boolean, (Default: false)
            slowMo?: number (Default: 0ms)
        },
        timeout?: number, (Default: 30000ms)
        defaultArgs?: {
            headless?: boolean,
            args?: Array<string>,
            userDataDir?: string,
            devtools?: boolean
        },
        harDir?: './path/to/artifatcs/dir/', (Default: './artifacts/har/')
        selenoid?: {
            host: string, (E.g.: 'selenoid.example.com' or 'localhost')
            port?: number (Default: 4444)
        },
        lighthouse?: {
            enable?: boolean, (Default: false) // This prop allows to connect Lighthouse to Protractor
            flags?: {[key: string]: any}, See types: https://github.com/GoogleChrome/lighthouse/blob/master/types/externs.d.ts#L151
                                            Default: {port: (!) Determined automatically, logLevel: 'info', output: ['json', 'html']}
                                            (!) It is not recommended to change the port.
            config?: {[key: string]: any}, See documentation: https://github.com/GoogleChrome/lighthouse/blob/master/docs/configuration.md
                                            and types: https://github.com/GoogleChrome/lighthouse/blob/master/types/config.d.ts#L16
                                            Default: https://github.com/GoogleChrome/lighthouse/blob/master/lighthouse-core/config/lr-desktop-config.js#L11
            reportsDir?: string (Default: './artifacts/lighthouse/')
        },
        logLevel?: 'verbose' | 'info' | 'warn' | 'error' | 'silent' (Default: 'info') // Changes the plugin logs
    }
}]
```
**(!) Note:** The `configFile` property takes precedence over the `configOptions` property.

### What should 'configFile' contain?

The `configFile` must be `.json` extension and contains the following properties.

E.g.:
```
// puppeteer.conf.json
{
    "connectToBrowser"?: boolean, (Default: false) // This prop allows to connect Puppeteer to Protractor
    "connectOptions"?: {
       "defaultViewport"?: {
           "width"?: number, (Default: 800px)
           "height"?: number, (Default: 600px)
           "deviceScaleFactor"?: number, (Default: 1)
           "isMobile"?: boolean, (Default: false)
           "hasTouch"?: boolean, (Default: false)
           "isLandscape"?: boolean (Default: false)
       },
       "ignoreHTTPSErrors"?: boolean, (Default: false)
       "slowMo"?: number (Default: 0ms)
    },
    "timeout"?: number, (Default: 30000ms)
    "defaultArgs"?: {
        "headless"?: boolean,
        "args"?: Array<string>,
        "userDataDir"?: string,
        "devtools"?: boolean
    },
    "harDir"?: "./path/to/artifatcs/dir/", (Default: "./artifacts/har/")
    "selenoid"?: {
        "host": string, (E.g.: "selenoid.example.com" or "localhost")
        "port"?: number (Default: 4444)
    },
    "lighthouse"?: {
        "enable"?: boolean, (Default: false) // This prop allows to connect Lighthouse to Protractor
        "flags"?: {[key: string]: any}, See types: https://github.com/GoogleChrome/lighthouse/blob/master/types/externs.d.ts#L151
                                        Default: {"port": (!) Determined automatically, "logLevel": "info", "output": ["json", "html"]}
                                        (!) It is not recommended to change the port.
        "config"?: {[key: string]: any}, See documentation: https://github.com/GoogleChrome/lighthouse/blob/master/docs/configuration.md
                                        and types: https://github.com/GoogleChrome/lighthouse/blob/master/types/config.d.ts#L16
                                        Default: https://github.com/GoogleChrome/lighthouse/blob/master/lighthouse-core/config/lr-desktop-config.js#L11
        "reportsDir"?: string (Default: "./artifacts/lighthouse/")
    },
    "logLevel"?: "verbose" | "info" | "warn" | "error" | "silent" (Default: "info") // Changes the plugin logs
}
```

### Documentation
* [`connectOptions`](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerconnectoptions)
* [`timeout`](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagesetdefaulttimeouttimeout)
* [`defaultArgs`](https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#puppeteerdefaultargsoptions)
* [`flags (types)`](https://github.com/GoogleChrome/lighthouse/blob/master/types/externs.d.ts#L151)
* [`config (types)`](https://github.com/GoogleChrome/lighthouse/blob/master/types/config.d.ts#L16)
* [`config (documentation)`](https://github.com/GoogleChrome/lighthouse/blob/master/docs/configuration.md)

## How to use:

1. If you would like to connect to browser by yourself,
or you would like to use some functions which return from `class: Puppeteer`,
you should use `puppeteer` property:

    ```javascript
    const {browser} = require('protractor');
    
    await browser.puppeteer.launch([options]);
    await browser.puppeteer.connect(options);
    await browser.puppeteer.createBrowserFetcher([options]);
    browser.puppeteer.defaultArgs([options]);
    
    const iDevices = browser.puppeteer.devices['iDevices'];
    
    // etc.
    ``` 
    
    More information about this class you can find here:
    * [`class: Puppeteer`](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-puppeteer)
    
2. If Puppeteer was connected by `protractor-puppeteer-plugin`, you should use `cdp` property.
The `cdp` property provides to use all features of Puppeteer after merging with Protractor.

    ```javascript
    const {browser} = require('protractor');
    
    browser.puppeteer.devices
    
    // ...
    
    browser.cdp.target
    browser.cdp.client
    browser.cdp.page
    browser.cdp.browser
    ```
    
    More information about this class you can find here:
    * [`class: Puppeteer`](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-puppeteer)
    * [`class: Target`](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-target)
    * [`class: CDPSession`](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-cdpsession)
    * [`class: Page`](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-page)
    * [`class: Browser`](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-browser)

3. For saving `har` files (with all calls from network) use:

    ```javascript
    const {browser} = require('protractor');
     
    await browser.har.start();
    // test actions
    await browser.har.stop(); // HAR file will stored automatically. Default: './artifacts/har/' directory.
    ```

    Saved files can be read by Chrome.

4. If `browser.restart()` was executed, you need to connect Puppeteer one more time:
   
   ```javascript
   const {browser} = require('protractor');
   const {setup} = require('protractor-puppeteer-plugin');
   
   await browser.restart();
   await setup();
   ```

5. Lighthouse. If you need to measure page performance, run the function:

    ```javascript
    const {browser} = require('protractor');
   
    await browser.lighthouse(url, {flags?, config?, connection?});
    // The report(s) will stored automatically. Default: './artifacts/lighthouse/' directory; '.html' and '.json' formats.
    ```
   
   where:
   * `url` - The URL to test.
   * `flags`- Optional settings for the Lighthouse run. If present, they will override any settings in the config;
        > Default flags: `{"port": (!) Determined automatically, "logLevel": "info", "output": ["json", "html"]}`.
        **(!) It is not recommended to change the port**.
        [Types](https://github.com/GoogleChrome/lighthouse/blob/master/types/externs.d.ts#L151).
   * `config` - Configuration for the Lighthouse run. If not present, the default config is used;
        > [Default config](https://github.com/GoogleChrome/lighthouse/blob/master/lighthouse-core/config/lr-desktop-config.js#L11),
        [Documentation](https://github.com/GoogleChrome/lighthouse/blob/master/docs/configuration.md) and
        [Types](https://github.com/GoogleChrome/lighthouse/blob/master/types/config.d.ts#L16).
   * `connection` - Custom connection if it's not ChromeProtocol. If not present, the `host` and `port` are used;;
        > [Source code](https://github.com/GoogleChrome/lighthouse/blob/master/lighthouse-core/gather/connections/cri.js)
   
   During the execution Lighthouse opens a new tab, performs necessary actions, closes the tab and generates a report.
   More information about this class you can find here:
   * [`Lighthouse`](https://github.com/GoogleChrome/lighthouse)

### Example:
```javascript    
// protractor.conf.js
plugins: [{
    package: 'protractor-puppeteer-plugin',
    configFile: './path/to/puppeteer.conf.json'
}]

// puppeteer.conf.json
{
    "connectToBrowser": true,
    "connectOptions": {
        "defaultViewport": {
            "width": 1366,
            "height": 768
        }
    },
    "timeout": 60000,
    "lighthouse": {
        "enable": true
    }
}   

// awesome.test.js
const {browser} = require('protractor');

describe('Example suite', () => {
    it('Protractor and Puppeteer together', async () => {
        await browser.get('https://angular.io/');

        await browser.cdp.page.waitForSelector('.button.hero-cta', {visible: true, hidden: false});
        await browser.$('.button.hero-cta').click();

        await browser.cdp.page.goto('https://cli.angular.io/', {waitUntil: ['networkidle0', 'domcontentloaded']});
        await browser.cdp.page.waitForResponse('https://cli.angular.io/favicon.ico');

        const getStartedBrn = browser.$('href="https://angular.io/cli"');

        await browser.wait(browser.ExpectedConditions.visibilityOf(getStartedBrn));

        await browser.har.start();
        await getStartedBrn.click();
        await browser.har.stop();

        expect(browser.$('aio-doc-viewer').isDisplayed()).to.eventually.equal(
            true,
            'The "Get started" page was not opened'
        );
    });

    it('Mocking a response using Puppeteer', async () => {
        await browser.cdp.page.setRequestInterception(true);

        browser.cdp.page.on('request', async request => {
            if (request.url().includes('photos')) {
                await request.respond({
                    body: '[{title: "Hello World!!!"}]'
                })
            } else {
                await request.continue();
            }
        });

        await browser.cdp.page.goto('http://jsonplaceholder.typicode.com/photos');
        // or
        // await browser.waitForAngularEnabled(false);
        // await browser.get('http://jsonplaceholder.typicode.com/photos');
    });

    it('Lighthouse example', async () => {
        await browser.lighthouse('https://angular.io/');
    });
});
```

```typescript
// ============== TypeScript ==============
// protractor.conf.ts
import {Config} from 'protractor';
import 'protractor-puppeteer-plugin'; // to have autocomplete

export const config: Config = {
    // ...
    plugins: [{
        configFile: {}, // ---> autocomplete is available
        configOptions: {} // ---> autocomplete is available
    }],
}

// awesome.test.ts
import {browser} from 'protractor';
import 'protractor-puppeteer-plugin'; // to have autocomplete

describe('Example suite', () => {
    it('Simple test', async () => { 
        browser.puppeteer. // ---> autocomplete is available
        browser.har. // ---> autocomplete is available
        browser.cdp. // ---> autocomplete is available
        await browser.lighthouse(params); // ---> autocomplete is available for params
    });
});
```

## How to use in Docker

1. If you would like to use autotests within the same container with `selenium-standalone/chrome`,
you don't need to do anything.

2. If you would like to use autotest and `selenium-standalone/chrome` in different containers,
you have to manage a port for Chrome debug protocol.
Since you won’t be able to know on which port the Chrome debugger is available,
and based on Chrome’s policy is prohibited connect to Chrome from the outside.

To do this, you need to pass the following arguments:
* `--headless`
* `--remote-debugging-address=0.0.0.0`
* `--remote-debugging-port=9222` - with port address you want

**(!)** But for parallel mode, you have to manage the ports by yourself.

```javascript
// protractor.conf.js
capabilities: {
    browserName: 'chrome',
    'goog:chromeOptions': {
        args: [
            '--headless',
            '--remote-debugging-address=0.0.0.0',
            '--remote-debugging-port=9222'
        ]
    }
}
```

More arguments you can find here: 
* [List of Chromium Command Line Switches](https://peter.sh/experiments/chromium-command-line-switches/)

## Workarounds

1. Error: '**Error: You probably have multiple tabs open to the same origin.**' during `await browser.lighthouse('https://my-site/')`:

**(!)** This workaround will be applied automatically, if the option `connectToBrowser: true` is set in the `protractor-puppeteer-plugin` config.
More details about the issue: https://github.com/GoogleChrome/lighthouse/issues/3024

```typescript
import {browser} from 'protractor';
import {describe, it} from 'mocha';
import 'protractor-puppeteer-plugin'

describe('Lighthouse workaround', () => {

    it('Failed test', async () => {
        // await browser.cdp.page.goto('https://angular.io/');
        // or
        await browser.get('https://angular.io/');
        await browser.$('.button.hero-cta').click();
        await browser.lighthouse('https://angular.io/'); // Error: You probably have multiple tabs open to the same origin.
    })

    it('Successful test', async () => {

        // await browser.cdp.page.goto('https://angular.io/');
        // or
        await browser.get('https://angular.io/');
        await browser.$('.button.hero-cta').click();
        
        // workaround

        async function lighthouse(url) {
            const currentUrl = browser.cdp.page.url();
            
            await browser.cdp.browser.newPage();
            const [firstPage, secondPage] = await browser.cdp.browser.pages();
            await firstPage.close();
            
            await browser.lighthouse(url);
            
            const [tab] = await browser.getAllWindowHandles();
            await browser.switchTo().window(tab);
            Object.assign(browser.cdp.page, secondPage);
            
            await browser.get(currentUrl); // Now it works
            // or
            // await browser.cdp.page.goto(currentUrl); // Now it works
        }
        
        await lighthouse('https://angular.io/');
    });
});
```

## Documentation:
Protractor:
* https://www.protractortest.org
* https://github.com/angular/protractor

Puppeteer:
* https://pptr.dev/
* https://github.com/puppeteer/puppeteer
* https://try-puppeteer.appspot.com/
* https://developers.google.com/web/tools/puppeteer
* Examples:
    * https://developers.google.com/web/tools/puppeteer/examples

Chrome DevTools Protocol:
* https://chromedevtools.github.io/devtools-protocol/

Lighthouse:
* https://github.com/GoogleChrome/lighthouse
* https://developers.google.com/web/tools/lighthouse
* https://github.com/GoogleChrome/lighthouse/blob/master/docs/readme.md#using-programmatically
* Using Puppeteer with Lighthouse:
    * https://github.com/GoogleChrome/lighthouse/blob/master/docs/puppeteer.md
