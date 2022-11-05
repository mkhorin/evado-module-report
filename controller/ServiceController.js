/**
 * @copyright Copyright (c) 2020 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('../component/base/BaseMetaController');

module.exports = class ServiceController extends Base {

    async actionNav () {
        const {id} = this.getQueryParams();
        const {children} = this.setNodeMetaParams({node: id});
        if (!children) {
            throw new NotFound('Invalid node children');
        }
        const menu = this.spawn(SideMenu, {
            view: this.createView()
        });
        const data = await menu.renderItems(children);
        this.send(data);
    }
};
module.exports.init(module);

const NotFound = require('areto/error/http/NotFound');
const SideMenu = require('../component/widget/SideMenu');