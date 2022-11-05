/**
 * @copyright Copyright (c) 2020 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('../component/base/BaseController');

module.exports = class DefaultController extends Base {

    static getConstants () {
        return {
            ACTIONS: {
                'widget': require('evado/component/action/WidgetAction')
            },
            METHODS: {}
        };
    }

    actionIndex () {
        const {defaultUrl} = this.module.params;
        return defaultUrl
            ? this.redirect(defaultUrl)
            : this.render('index');
    }
};
module.exports.init(module);