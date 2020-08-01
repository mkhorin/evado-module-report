/**
 * @copyright Copyright (c) 2020 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('../component/base/CrudController');

module.exports = class DataController extends Base {

    constructor (config) {
        super(config);
        this.metaHub = this.module.getMetaHub();
        this.navMeta = this.metaHub.get('navigation');
        this.reportMeta = this.metaHub.get('report');
        this.meta = {};
        this.extraMeta = this.module.get('extraMeta');
    }

    async actionList () {
        this.setMetaParams();
        const model = await this.spawn('model/Model').findById(this.getPostParam('ownerId')).inReadyState().one();
        if (!model) {
            throw new BadRequest(`Report model not found`);
        }
        // await this.security.resolveOnReport(this.meta.report);
        this.sendJson(await this.spawn(MetaGrid, {
            controller: this,
            query: this.meta.report.findByOwner(model.getId(), this.getSpawnConfig())
        }).getList());
    }

    setMetaParams () {
        const node = this.navMeta.getNode(this.getQueryParam('n'));
        if (!node) {
            throw new NotFound('Node not found');
        }
        const report = this.reportMeta.getReport(node.data.report);
        if (!report) {
            throw new BadRequest(`Report not found`);
        }
        this.meta.node = node;
        this.meta.report = report;
    }
};
module.exports.init(module);

const NotFound = require('areto/error/http/NotFound');
const BadRequest = require('areto/error/http/BadRequest');
const MetaGrid = require('../component/meta/MetaGrid');