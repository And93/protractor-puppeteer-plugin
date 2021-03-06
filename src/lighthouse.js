'use strict';

const lighthouseLib = require('lighthouse');
const protractor = require('protractor');
const {URL} = require('url');

const FileSystem = require('./helpers/fileSystem');

const {Logger} = require('./helpers/logger');
const logger = Logger('Protractor and Lighthouse');

let defaultParams;
let fileSystem;

class Lighthouse {

    /**
     * @param lighthouseConfig {{flags: LH.Flags=, config: LH.Config.Json=, reportsDir: string=}}
     * @param url {string}. browserURL or browserWSEndpoint
     */
    constructor({lighthouseConfig, url}) {

        fileSystem = new FileSystem(lighthouseConfig.reportsDir || './artifacts/lighthouse/');

        const {port} = new URL(url);

        defaultParams = {
            flags: Object.assign(
                {
                    port,
                    logLevel: 'info',
                    output: ['json', 'html']
                },
                lighthouseConfig.flags
            ),
            config: lighthouseConfig.config || require('lighthouse/lighthouse-core/config/lr-desktop-config.js'),
            reportName: 'lighthouse_report'
        }
    }

    /**
     * @param url {string}
     * @param params {{
     *     flags: LH.Flags=,
     *     config: LH.Config.Json=,
     *     connection: LH.Connection=,
     *     reportName: string=
     * }}
     * @return {Promise<LH.RunnerResult>}
     */
    async lighthouse(url, params) {

        const {flags, config, connection, reportName} = Object.assign({}, defaultParams, params);

        logger.info('Audit is started');

        let result;

        try {
            logger.debug(url);
            logger.debug({flags, config, connection, reportName});

            result = await lighthouseLib(url, flags, config, connection);
        } catch (e) {

            // https://github.com/GoogleChrome/lighthouse/issues/3024
            if (e.message.includes('You probably have multiple tabs open to the same origin') && 'cdp' in protractor.browser) {
                const currentUrl = protractor.browser.cdp.page.url();

                await protractor.browser.cdp.browser.newPage();
                const [firstPage, secondPage] = await protractor.browser.cdp.browser.pages();
                await firstPage.close();

                result = await lighthouseLib(url, flags, config, connection);

                const [tab] = await protractor.browser.driver.getAllWindowHandles();
                await protractor.browser.driver.switchTo().window(tab);
                Object.assign(protractor.browser.cdp.page, secondPage);

                await protractor.browser.driver.get(currentUrl);

                logger.warn('Applied a workaround for lighthouse function due to the issue. ' +
                    'Please check the issue for more details: https://github.com/GoogleChrome/lighthouse/issues/3024'
                );
            } else if (e.message.includes('You probably have multiple tabs open to the same origin')) {
                e.message += '\n\tPlease check the issue for more details: https://github.com/GoogleChrome/lighthouse/issues/3024' +
                    '\n\tThis issue may occur for PWA apps or when Service workers present on the page.' +
                    '\n\tFor automatically applying a known workaround, please setup `connectToBrowser: true` option in the `protractor-puppeteer-plugin` config' +
                    '\n\tWhat this workaround is you can find here: protractor-puppeteer-plugin > README.md > Workarounds' +
                    '\n\t(https://github.com/And93/protractor-puppeteer-plugin/#workarounds)\n';

                throw e;
            } else {
                throw e;
            }
        }

        logger.info('Audit is finished');

        if (flags.output) {

            if (typeof reportName !== 'string' || reportName.length > 200) {
                const currentName = {
                    name: reportName,
                    type: typeof reportName,
                    length: reportName.length
                }
                throw new Error(`The type of 'Lighthouse' report prefix must be 'string' and contain no more than 200 symbols. Current ${JSON.stringify(currentName)}`);
            }

            fileSystem.makeDir();

            const timestamp = new Date().valueOf();
            const {pid} = process;
            const _reportName = reportName.replace(/ /gm, '_');

            const writeReport = (data, extension) => {
                const name = `${timestamp}_PID_${pid}_${_reportName}.${extension}`;

                logger.debug(`Report name: '${name}'`);
                logger.info(`The '${extension}' report is generated'`);

                fileSystem.writeFileStream(data, name);
            }

            if (Array.isArray(flags.output)) {
                result.report.forEach((report, i) => writeReport(report, flags.output[i]));
            } else {
                writeReport(result.report, flags.output);
            }
        }

        return result;
    }
}

module.exports = Lighthouse;
