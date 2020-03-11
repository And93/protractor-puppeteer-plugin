# Protractor-puppeteer plugin

## Dependencies:
```
    "@types/puppeteer": "2.0.0"
    "chrome-har": "0.11.7",
    "puppeteer-core": "2.1.1"
```

## Requirements:
- Chrome >=80
- npm >=6
- node >=10

## How to add this plugin to protractor:

``` 
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
            }
        }
    ]
```
(!) Note: The `configFile` property takes precedence over the `configOptions` property.

#### What should 'configFile' contain?

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
    }
```

#### Documentation
* `connectOptions`: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerconnectoptions
* `timeout`: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagesetdefaulttimeouttimeout
* `defaultArgs`: https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#puppeteerdefaultargsoptions

## How to use:

1. If you would like to connect to browser by yourself
or you would like to use some of the functions which return from 'class: Puppeteer',
you should use `puppeteer` property:

    ```
        // myTest.js
        
        browser.puppeteer.launch([options]);
        browser.puppeteer.connect(options);
        browser.puppeteer.createBrowserFetcher([options]);
        browser.puppeteer.defaultArgs([options]);
        
        const iDevices = browser.puppeteer.devices['iDevices'];
    
        etc.
    ``` 
    More information about this class you can find here:
    * class: **Puppeteer**: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-puppeteer
    
2. If Puppeteer was connected by `protractor-puppeteer-plugin`, you should use `cdp` property.
The `cdp` property provides to use all features of Puppeteer after merging with Protractor.

    ```
        // myTest.js
        
        browser.puppeteer.devices
   
        ...
        
        browser.cdp.target
        browser.cdp.client
        browser.cdp.page
        browser.cdp.browser
    ```
    More information about this class you can find here:
    * class: **Puppeteer**: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-puppeteer
    * class: **Target**: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-target
    * class: **CDPSession**: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-cdpsession
    * class: **Page**: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-page
    * class: **Browser**: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-browser

3. For saving har files (with all calls from network) use:
    ```
        await browser.har.start();
        // test actions
        await browser.har.stop();
    ```

#### Example:
```
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
    
    // myTest.js
    describe('Suite name', () => {
        it('Test name', async () => {
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
    });
```

#### How to use this plugin if tests run in Docker: (TODO)

Docker image
Docker compose


For this you have to pass the following arguments:
* `--headless`
* `--remote-debugging-address=0.0.0.0` - with ip address you want.
* `--remote-debugging-port=9222` - with port address you want

(!) But for parallel mode, you have to manage the ports by yourself.

```
    capabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
            args: [
                '--headless',
                '--remote-debugging-address=0.0.0.0',
                '--remote-debugging-port=9222',
            ],
        },
    },
```

More arguments you can find here: 
* List of Chromium Command Line Switches: https://peter.sh/experiments/chromium-command-line-switches/

### Documentation:
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

### Contacts:
andreidei4ik@gmail.com
