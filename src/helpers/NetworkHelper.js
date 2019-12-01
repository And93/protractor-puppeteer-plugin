'use strict';
const {FileSystemHelper} = require('./FileSystemHelper');

class NetworkHelper {

    constructor(page, path = './artifacts/network/') {
        this._page = page;
        this._fileSystemHelper = new FileSystemHelper(path);
    }

    setRequestInterception(state) {
        return this._page.setRequestInterception(state);
    }

    catchTraffic(eventName, method, handler) {
        this._page[method](eventName, handler);
    }

    catchTrafficAndWriteFile(param) {
        this.catchTraffic(param, 'on', re => {
            this._fileSystemHelper.makeDir();
            this._fileSystemHelper.writeFileStream(JSON.stringify(re), this._fileName(param));
        });
    }

    _fileName(name) {
        return `${new Date().valueOf()}_PID_${process.pid}_network_browser_${name}.log`
    }
}

module.exports = {NetworkHelper};
