/**
 * @copyright Copyright (c) 2020 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('areto/view/ViewModel');

module.exports = class ModelList extends Base {

    prepareModels (models) {
        for (const model of models) {
            model.set('stateCode', model.get('state'));
            model.setViewAttr('creator', model.get('creator.name'));
        }
    }
};