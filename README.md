# Protractor-puppeteer plugin

## Dependencies:
```
    "protractor": "5.4.2",
    "puppeteer-core": "1.20.0",
    "request-promise-native": "1.0.7"
```

## Requirements:
- Chrome
- npm >=5.7.1
- node >=8.9.1

## How to add this plugin to protractor:

``` 
    // protractor.conf.js
    
    plugins: [
        {
            package: 'protractor-puppeteer-plugin',
            (or path: require.resolve('protractor-puppeteer-plugin'))
            connectToBrowser: boolean, (Defailt: false)
            sizeWindow: {
                width: number, (Default: 800px)
                height: number (Defailt: 600px)
            },
            timeout: number, (Default: 30000ms)
            catchRequests: boolean (Defailt: false)
        }
    ]
```

## How to use

1. If you would like to connect to browser by yourself
or you would like to use some of the functions which returns from 'class: Puppeteer', you should use `puppeteer` property:

    ```
        // myTest.js
        
        browser.puppeteer.launch([options])
        browser.puppeteer.connect(options);
        browser.puppeteer.createBrowserFetcher([options])
        browser.puppeteer.defaultArgs([options])
        browser.puppeteer.devices
    
        etc.
    ``` 
    More information about this class you can find here:
    * class: **Puppeteer**: https://github.com/GoogleChrome/puppeteer/blob/v1.20.0/docs/api.md#class-puppeteer
    
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
    * class: **Puppeteer**: https://github.com/GoogleChrome/puppeteer/blob/v1.20.0/docs/api.md#class-puppeteer
    * class: **Target**: https://github.com/GoogleChrome/puppeteer/blob/v1.20.0/docs/api.md#class-target
    * class: **CDPSession**: https://github.com/GoogleChrome/puppeteer/blob/v1.20.0/docs/api.md#class-cdpsession
    * class: **Page**: https://github.com/GoogleChrome/puppeteer/blob/v1.20.0/docs/api.md#class-page
    * class: **Browser**: https://github.com/GoogleChrome/puppeteer/blob/v1.20.0/docs/api.md#class-browser

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
    * class: **Request**: https://github.com/GoogleChrome/puppeteer/blob/v1.20.0/docs/api.md#class-request
    * request.continue([overrides]): https://github.com/GoogleChrome/puppeteer/blob/v1.20.0/docs/api.md#requestcontinueoverrides

#### Example
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
            await browser.channel.page.waitForNavigation({waitUntil: 'networkidle0'})
            await browser.channel.page.goto('https://cli.angular.io/', {waitUntil: 'networkidle0'});
            await browser.channel.page.waitForResponse('https://cli.angular.io/favicon.ico');
            ...
        });
    });
```

### Documentation
Protractor:
* https://www.protractortest.org
* https://github.com/angular/protractor

Puppeteer:
* https://pptr.dev/
* https://github.com/GoogleChrome/puppeteer 

Chrome DevTools Protocol:
* https://chromedevtools.github.io/devtools-protocol/

### Contacts
andreidei4ik@gmail.com
