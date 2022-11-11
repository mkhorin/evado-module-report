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
        const {ownerId} = this.getPostParams();
        const modelQuery = this.spawn('model/Model').findById(ownerId).inReadyState();
        const model = await modelQuery.one();
        if (!model) {
            throw new NotFound(`Report model not found`);
        }
        // await this.security.resolveOnReport(this.meta.report);
        const config = this.getSpawnConfig();
        const query = this.meta.report.createQuery(config).byOwner(model.getId());
        const grid = this.spawn(MetaGrid, {controller: this, query});
        const data = await grid.getList();
        this.sendJson(data);
    }

    setMetaParams () {
        const {n} =this.getQueryParams();
        const node = this.navMeta.getNode(n);
        if (!node) {
            throw new NotFound('Node not found');
        }
        const report = this.reportMeta.getReport(node.data.report);
        if (!report) {
            throw new NotFound(`Report not found`);
        }
        this.meta.node = node;
        this.meta.report = report;
    }
};
module.exports.init(module);

const NotFound = require('areto/error/http/NotFound');
const BadRequest = require('areto/error/http/BadRequest');
const MetaGrid = require('../component/meta/MetaGrid');