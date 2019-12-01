'use strict';
const {createWriteStream, mkdirSync} = require('fs');
const {join, resolve} = require('path');

class FileSystemHelper {
    constructor(path) {
        this._path = path;
    }

    getDirPath(dirname = this._path) {
        return resolve(join(process.cwd(), dirname));
    }

    makeDir() {
        return mkdirSync(this.getDirPath());
    }

    writeFileStream(data, name, encoding) {
        const file = join(process.cwd(), this._path, name);
        const stream = createWriteStream(file);
        stream.write(Buffer.from(data, encoding));
        stream.end();
    }
}

module.exports = {FileSystemHelper};
