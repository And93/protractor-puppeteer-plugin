'use strict';

const {createWriteStream, mkdirSync, existsSync} = require('fs');
const {join, resolve} = require('path');

class FileSystem {
    /**
     * @param path {string}
     */
    constructor(path) {
        this.path = path;
    }

    /**
     * @param dirname {string}
     * @return {string}
     */
    getDirPath(dirname = this.path) {
        return resolve(join(process.cwd(), dirname));
    }

    makeDir() {
        if (!existsSync(this.getDirPath())) {
            return mkdirSync(this.getDirPath(), {recursive: true});
        }
    }

    /**
     * @param data {string}
     * @param name {string}
     * @param encoding {BufferEncoding=}
     */
    writeFileStream(data, name, encoding) {
        const file = join(process.cwd(), this.path, name);
        const stream = createWriteStream(file);
        stream.write(Buffer.from(data, encoding));
        stream.end();
    }
}

module.exports = FileSystem;
