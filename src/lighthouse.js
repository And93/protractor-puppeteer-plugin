'use strict';
const lighthouseLib = require('lighthouse');
const {URL} = require('url');

const FileSystem = require('./helpers/fileSystem');

const {logger: loggerFn} = require('./helpers/logger');
const logger = loggerFn('Protractor and Lighthouse');

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
            config: lighthouseConfig.config || require('lighthouse/lighthouse-core/config/lr-desktop-config.js')
        }
    }

    /**
     * @param url {string}
     * @param flags {LH.Flags=}
     * @param config {LH.Config.Json=}
     * @param connection {LH.Connection=}
     * @return {Promise<LH.RunnerResult>}
     */
    async lighthouse(url, {flags, config, connection} = defaultParams) {

        logger.info('Audit is started');

        let result;

        try {
            result = await lighthouseLib(url, flags, config, connection);
        } catch (e) {

            if (e.message.includes('You probably have multiple tabs open to the same origin')) {
                e.message += '\n\tPlease check the issue for more details: https://github.com/GoogleChrome/lighthouse/issues/3024' +
                    '\n\tYou can find a workaround here: README.md > Workarounds\n';
            }
            throw e;
        }

        logger.info('Audit is finished');

        if (flags.output) {
            fileSystem.makeDir();

            function writeReport(data, extension) {
                const reportName = `${new Date().valueOf()}_PID_${process.pid}_lighthouse_report.${extension}`;

                logger.info(`The '${extension}' report is generated'`);

                fileSystem.writeFileStream(data, reportName);
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
