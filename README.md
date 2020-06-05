# Protractor-puppeteer plugin

The main goal of this plugin is to enable the use of two tools in autotests written on Protractor.

**Chrome only supported.**

## Requirements:

| Protractor-puppeteer plugin | Protractor | Puppeteer | NodeJS |
|-----------------------------|------------|-----------|--------|
| ^1.0.0                      | ^5.0.0     | ^2.1.0    | ^10    |
| ^2.0.0 (`Current`)          | ^5.0.0     | ^3.0.0    | ^10    |

## How to add this plugin to protractor:

```javascript
    // protractor.conf.js
    
    plugins: [
        {
            package: 'protractor-puppeteer-plugin',
            (or path: require.resolve('protractor-puppeteer-plugin'))
            configFile?: './path/to/puppeteer.conf.json',
            configOptions?: {
                connectToBrowser?: boolean, (Default: false)
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
                }
            }
        }
    ]
```
**(!) Note:** The `configFile` property takes precedence over the `configOptions` property.

### What should 'configFile' contain?

The `configFile` must be `.json` extension and contains the following properties.

E.g.:
```
    {
        "connectToBrowser"?: boolean, (Default: false)
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
        }
    }
```

### Documentation
* [`connectOptions`](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerconnectoptions)
* [`timeout`](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagesetdefaulttimeouttimeout)
* [`defaultArgs`](https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#puppeteerdefaultargsoptions)

## How to use:

1. If you would like to connect to browser by yourself,
or you would like to use some functions which return from 'class: Puppeteer',
you should use `puppeteer` property:

```javascript
// myTest.js
const {browser} = require('protractor');

browser.puppeteer.launch([options]);
browser.puppeteer.connect(options);
browser.puppeteer.createBrowserFetcher([options]);
browser.puppeteer.defaultArgs([options]);

const iDevices = browser.puppeteer.devices['iDevices'];

// etc.
``` 
    More information about this class you can find here:
    * [`class: Puppeteer`](https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-puppeteer)
    
2. If Puppeteer was connected by `protractor-puppeteer-plugin`, you should use `cdp` property.
The `cdp` property provides to use all features of Puppeteer after merging with Protractor.

```javascript
// myTest.js

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

3. For saving har files (with all calls from network) use:
```javascript    
await browser.har.start();
// test actions
await browser.har.stop();
```

    Saved files can be read by Chrome.

4. If `browser.restart()` was executed, you need to connect Puppeteer one more time:
    ```
   const {browser} = require('protractor');
   const {setup} = require('protractor-puppeteer-plugin');
   
   await browser.restart();
   await setup();
   ```

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
        "timeout": 60000
    }   
    
    // awesome.test.js
    const {browser} = require('protractor');
    
    describe('Example suite', () => {
        it('Simple test', async () => {
            await browser.get('https://angular.io/');
            await browser.$('.hero-background a[href="https://angular.io/cli"]').click();
            await browser.cdp.page.waitForNavigation({waitUntil: 'networkidle0'});
            await browser.cdp.page.waitForSelector('#start', {visible: true, hidden: false});
            await browser.cdp.page.goto('https://cli.angular.io/', {waitUntil: ['networkidle0', 'domcontentloaded']});
            await browser.cdp.page.waitForResponse('https://cli.angular.io/favicon.ico');
            
            const getStartedBrn = browser.$('[href="https://angular.io/cli"]');
            
            await browser.wait(ExpectedConditions.visibilityOf(getStartedBrn));
            await getStartedBrn.click();

            expect(browser.$('aio-doc-viewer').isDisplayed()).to.eventually.equal(true, 'The "Get started" page was not opened');
        });

        it('Mocking a response', async () => {
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
    });
```
```typescript
    ============== TypeScript ==============
    
    // awesome.test.ts
    import {browser} from 'protractor';
    import 'protractor-puppeteer-plugin'; // to have autocomplete

    describe('Example suite', () => {
        it('Simple test', async () => { 
            browser.puppeteer. ---> autocomplete is available
            browser.har. ---> autocomplete is available
            browser.cdp. ---> autocomplete is available
        });
    });
```

## How to use in Docker

1. If you would like to use autotests within the same container with selenium-standalone/chrome, you don't need to do anything.

2. If you would like to use autotest and selenium-standalone/chrome in different containers,
you have to manage a port for Chrome debug protocol.
Since you won’t be able to know on which port the Chrome debugger is available,
and based on Chrome’s policy is prohibited connect to Chrome from the outside.

To do this, you need to pass the following arguments:
* `--headless`
* `--remote-debugging-address=0.0.0.0`
* `--remote-debugging-port=9222` - with port address you want

**(!)** But for parallel mode, you have to manage the ports by yourself.

```
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

## Documentation:
Protractor:
* https://www.protractortest.org
* https://github.com/angular/protractor

Puppeteer:
* https://pptr.dev/
* https://github.com/GoogleChrome/puppeteer
* https://try-puppeteer.appspot.com/
* https://developers.google.com/web/tools/puppeteer
* Examples:
    * https://developers.google.com/web/tools/puppeteer/examples

Chrome DevTools Protocol:
* https://chromedevtools.github.io/devtools-protocol/
