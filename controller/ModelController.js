/**
 * @copyright Copyright (c) 2020 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('../component/base/CrudController');

module.exports = class ModelController extends Base {

    constructor (config) {
        super(config);
        this.metaHub = this.module.getMetaHub();
        this.navMeta = this.metaHub.get('navigation');
        this.reportMeta = this.metaHub.get('report');
        this.meta = {};
        this.extraMeta = this.module.get('extraMeta');
    }

    async actionIndex () {
        this.setNodeMetaParams();
        const model = this.spawn('model/Model');
        const query = model.find().inReadyState().byReport(this.meta.report);
        const ownerId = await query.max(model.PK);
        const templateData = this.getMetaParams({ownerId});
        return super.actionIndex({templateData});
    }

    actionCreate () {
        this.setNodeMetaParams();
        const model = this.spawn('model/Model');
        model.set('report', this.meta.report.id);
        const templateData = this.getMetaParams();
        return super.actionCreate({model, templateData});
    }

    actionUpdate () {
        const params = this.getMetaParams();
        return super.actionUpdate({
            with: 'creator',
            templateData: params
        });
    }

    actionList () {
        this.setNodeMetaParams();
        const model = this.spawn('model/Model');
        const query = model.find().byReport(this.meta.report).with('creator');
        return super.actionList(query);
    }

    getMetaParams (params) {
        return {
            reportMeta: this.reportMeta,
            extraMeta: this.extraMeta,
            meta: this.meta,
            ...params
        };
    }

    setNodeMetaParams () {
        const {n} = this.getQueryParams();
        const node = this.navMeta.getNode(n);
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