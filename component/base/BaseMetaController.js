/**
 * @copyright Copyright (c) 2020 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('areto/base/Controller');

module.exports = class BaseMetaController extends Base {

    static getConstants () {
        return {
            //ACTION_VIEW: require('../meta/MetaActionView')
        };
    }

    constructor (config) {
        super(config);
        this.metaHub = this.module.getMetaHub();
        this.baseMeta = this.metaHub.get('base');
        this.navMeta = this.metaHub.get('navigation');
        this.reportMeta = this.metaHub.get('report');
        this.security = this.createMetaSecurity();
        this.meta = this.spawn(MetaParams);
        this.meta.security = this.security;
    }

    createMetaSecurity (config) {
        return this.spawn(MetaSecurity, {controller: this, ...config});
    }

    createMetaTransit () {
        return this.spawn(MetaTransit, {
            controller: this,
            security: this.security
        });
    }

    setMetaParams (params = {}) {
        const data = this.meta;
        data.class = this.baseMeta.getClass(params.source || this.getQueryParam('c'));
        if (!data.class) {
            throw new BadRequest('Meta class not found');
        }
        data.view = data.class.getViewByPrefix(this.module.NAME, params.viewName) || data.class;
        return this.setMasterRelationMetaParams();
    }

    setAttrMetaParams (param) {
        const [attrName, viewName, className] = String(param).split('.');
        const data = this.meta;
        data.class = this.baseMeta.getClass(className);
        if (!data.class) {
            throw new BadRequest(`Meta class not found: ${param}`);
        }
        data.view = data.class.getViewByPrefix(this.module.NAME, viewName) || data.class;
        data.attr = data.view.getAttr(attrName);
        if (!data.attr) {
            throw new BadRequest(`Meta attribute not found: ${param}`);
        }
    }

    async setMasterRelationMetaParams (param) {
        param = param || this.getQueryParam('m');
        if (!param) {
            return null;
        }
        const [attrName, id, className] = String(param).split('.');
        const master = this.meta.master;
        master.class = this.baseMeta.getClass(className);
        if (!master.class) {
            throw new BadRequest(`Master class not found: ${param}`);
        }
        master.view = master.class;
        master.attr = master.view.getAttr(attrName);
        if (!master.attr) {
            throw new BadRequest(`Master attribute not found: ${param}`);
        }
        if (!this.meta.master.attr.relation) {
            throw new BadRequest(`Invalid master relation: ${param}`);
        }
        if (!id) {
            master.model = master.view.spawnModel(this.getSpawnConfig());
            return master.model;
        }
        master.model = await master.view.findById(id, this.getSpawnConfig()).one();
        if (!master.model) {
            throw new NotFound(`Master model not found: ${param}`);
        }
    }

    setViewNodeMetaParams (params) {
        this.setNodeMetaParams(params);
        if (!this.meta.view) {
            throw new BadRequest(`Node view not found`);
        }
    }

    setNodeMetaParams (params = {}) {
        let node = params.node || this.getQueryParam('n');
        node = this.navMeta.getNode(node, this.module.NAME);
        if (!node) {
            throw new NotFound('Node not found');
        }
        const metaClass = this.baseMeta.getClass(node.data.class);
        this.meta.node = node;
        this.meta.class = metaClass;
        this.meta.view = metaClass && metaClass.getView(node.data.view || params.viewName) || metaClass;
        return node;
    }

    getMetaParams (params) {
        return {
            baseMeta: this.baseMeta,
            extraMeta: this.extraMeta,
            meta: this.meta,
            security: this.security,
            readOnly: false,
            ...params
        };
    }

    handleModelError (model) {
        this.send({[model.class.name]: this.translateMessageMap(model.getFirstErrorMap())}, 400);
    }

    async renderMeta (template, params) {
        return this.render(template, Object.assign(params, {
            hasUtility: await this.hasUtility()
        }));
    }

    hasUtility () {
        return this.module.get('utility').isActiveUtility({
            controller: this,
            modelAction: this.action.name
        });
    }

    log (type, message, data) {
        message = this.meta.view ? `${this.meta.view.id}: ${message}` : message;
        this.baseMeta.log(type, message, data);
    }
};

const BadRequest = require('areto/error/BadRequestHttpException');
const NotFound = require('areto/error/NotFoundHttpException');
const MetaParams = require('evado/component/meta/MetaParams');
const MetaTransit = require('evado/component/meta/MetaTransit');
const MetaSecurity = require('evado/component/meta/MetaSecurity');