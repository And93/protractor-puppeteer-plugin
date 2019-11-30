import {ProtractorPlugin} from 'protractor/built/plugins';
import {setup} from './src/Plugin';

declare var module: any;

const plugin: ProtractorPlugin = {
    name: 'protractor-puppeteer-plugin',
    setup
};

module.exports = plugin;
