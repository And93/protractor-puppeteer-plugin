# Protractor-puppeteer plugin

## Dependencies:
```
    "@types/puppeteer": "1.20.1"
    "protractor": "5.4.2"
    "puppeteer-core": "1.20.0"
```

## Requirements:
- Chrome >=76 (because Puppeteer v1.20.0)
- npm >=5.7.1
- node >=8.9.1

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
                    defaultViewpor?: {
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
                capture?: {
                    setRequestInterception: boolean, (Default: false)
                    overrides?: {
                        url?: string,
                        method?: string,
                        postData?: string,
                        headers?: Object
                    },
                    catchRequests?: {
                        finished?: boolean, (Default: false)
                        failed?: boolean, (Default: false)
                    },
                    catchResponses?: boolean (Default: false)
                }
            }
        }
    ]
```
(!) Note: The `configFile` property takes precedence over the `configOptions` property.

#### Documentation
* [connectOptions]|(https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerconnectoptions)
* [timeout]|(https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagesetdefaulttimeouttimeout)
* [catchRequests]|(https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-request)
* [catchResponses]|(https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-response)


## How to use:

1. If you would like to connect to browser by yourself
or you would like to use some of the functions which returns from 'class: Puppeteer', you should use `puppeteer` property:

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
    
2. If Puppeteer was connected by protractor-puppeteer-plugin, you should use `channel` property:

    ```
        // myTest.js
        
        browser.puppeteer.devices
   
        ...
        
        browser.channel.target
        
        browser.channel.client
        
        browser.channel.page
    
        browser.channel.browser
    ```
    More information about this class you can find here:
    * class: **Puppeteer**: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-puppeteer
    * class: **Target**: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-target
    * class: **CDPSession**: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-cdpsession
    * class: **Page**: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-page
    * class: **Browser**: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-browser

3. (!) If you would like to override some requests all headers, do not set `catchRequests` property in the config, because you will
have the following error: `(node:5636) UnhandledPromiseRejectionWarning: Error: Request is already handled!`.
In this case, you can switch this feature in a test and then override what you wish.

    ```
        // catchRequests: true
        
        browser.channel.page.on('requestfailed', _request => {
            console.log(`requestfailed: ${_request.url()} ${_request.failure().errorText}`);
            console.log(_request.headers());
        });
    
        // catchRequests: false
        
        browser.channel.page.setRequestInterception(true);
    
        browser.channel.page.on('request', _request => {
            _request.continue([overrides]);
        });
    ```
    
    More details:
    * class: **Request**: https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#class-request
    * request.continue([overrides]): https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#requestcontinueoverrides

#### Example:
```
    // protractor.conf.js
    plugins: [
        {
            package: 'protractor-puppeteer-plugin',
            connectToBrowser: true,
            sizeWindow: {
                width: 1366,
                height: 768
            },
            timeout: 60000,
            catchRequests: true
        }
    ]

    // myTest.js
    describe('Suite name', () => {
        it('Test name', async () => {
            await browser.get('https://angular.io/');
            
            await browser.$('#intro [href="start"]').click();
            await browser.channel.page.waitForNavigation({waitUntil: 'networkidle0'});
            
            await browser.channel.page.goto('https://cli.angular.io/', {waitUntil: 'networkidle0'});
            await browser.channel.page.waitForResponse('https://cli.angular.io/favicon.ico');

            const getStartedBrn = protractor.$('[href="https://angular.io/cli"]');
            await browser.wait(protractor.ExpectedConditions.visibilityOf(getStartedBrn));
            await getStartedBrn.click();

            expect(protractor.$('aio-doc-viewer').isDisplayed()).to.eventually.equal(
                true,
                'the get started page was not opened'
            );
        });
    });
```

### Documentation:
Protractor:
* https://www.protractortest.org
* https://github.com/angular/protractor

Puppeteer:
* https://pptr.dev/
* https://github.com/GoogleChrome/puppeteer 

Chrome DevTools Protocol:
* https://chromedevtools.github.io/devtools-protocol/

### Contacts:
andreidei4ik@gmail.com
