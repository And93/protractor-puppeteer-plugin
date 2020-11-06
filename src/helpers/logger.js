'use strict';

/**
 * @type {'verbose' | 'info' | 'warn' |'error' | 'silent'}
 */
let logLevel = 'info';

/**
 * @param lvl {'verbose' | 'info' | 'warn' |'error' | 'silent'=}
 */
function setLogLevel(lvl) {
    if (lvl) {
        logLevel = lvl;
    }
}

/**
 * @param namespace {string}
 */
function Logger(namespace) {
    logLevel = logLevel.toLowerCase();

    if (logLevel === 'silent') {
        return;
    }

    /**
     * @param type {'VERBOSE' | 'INFO' | 'WARN' | 'ERROR'}
     * @param value {any}
     * @return {string}
     */
    const log = (type, value) => {
        const date = new Date();
        const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`;
        return `[${time}] [PID: ${process.pid}] [${type}] ${namespace} - ${JSON.stringify(value)}`;
    };

    return {
        /**
         * @param value {any}
         * @return {void}
         */
        debug(value) {
            if (logLevel === 'verbose') {
                return console.debug(log('VERBOSE', value));
            }
        },
        /**
         * @param value {any}
         * @return {void}
         */
        info(value) {
            if (logLevel === 'verbose' || logLevel === 'info') {
                return console.info(log('INFO', value));
            }
        },
        /**
         * @param value {any}
         * @return {void}
         */
        warn(value) {
            if (logLevel === 'verbose' || logLevel === 'info' || logLevel === 'warn') {
                return console.warn(log('WARN', value));
            }
        },
        /**
         * @param value {any}
         * @return {void}
         */
        error(value) {
            if (logLevel === 'verbose' || logLevel === 'info' || logLevel === 'warn' || logLevel === 'error') {
                return console.error(log('ERROR', value));
            }
        },
    }
}

module.exports = {
    Logger,
    setLogLevel
};
