# Protractor-puppeteer plugin

## How to add this plugin to protractor:

``` 
    // protractor.conf.js
    
    plugins: [
        {
            name: 'protractor-puppeteer-plugin',
            (or path: require.resolve('protractor-puppeteer-plugin'))
            connectToBrowser: boolean,
            sizeWindow: {
                width: number,
                height: number
            },
            timeout: number,
            catchRequests: boolean
        }
    ]
```
