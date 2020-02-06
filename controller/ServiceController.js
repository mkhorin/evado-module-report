/**
 * @copyright Copyright (c) 2020 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('../component/base/BaseMetaController');

module.exports = class ServiceController extends Base {

    async actionNav () {
        const node = this.setNodeMetaParams({node: this.getQueryParam('id')});
        if (!node.children) {
            throw new NotFound('Invalid node children');
        }
        const menu = this.spawn(SideMenu, {view: this.createView()});
        this.send(await menu.renderItems(node.children));
    }
};
module.exports.init(module);

const NotFound = require('areto/error/NotFoundHttpException');
const SideMenu = require('../component/widget/SideMenu');