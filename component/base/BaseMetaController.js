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
        const {c} = this.getQueryParams();
        const {meta} = this;
        meta.class = this.baseMeta.getClass(params.source || c);
        if (!meta.class) {
            throw new BadRequest('Meta class not found');
        }
        meta.view = meta.class.getViewWithPrefix(this.module.name, params.viewName) || meta.class;
        return this.setMasterMetaParams();
    }

    setAttrMetaParams (param) {
        const [attrName, viewName, className] = String(param).split('.');
        const {meta} = this;
        meta.class = this.baseMeta.getClass(className);
        if (!meta.class) {
            throw new BadRequest(`Meta class not found: ${param}`);
        }
        meta.view = meta.class.getViewWithPrefix(this.module.name, viewName) || meta.class;
        meta.attr = meta.view.getAttr(attrName);
        if (!meta.attr) {
            throw new BadRequest(`Meta attribute not found: ${param}`);
        }
    }

    async setMasterMetaParams (data) {
        if (!data) {
            data = this.getQueryParam('m');
        }
        if (!data) {
            return null;
        }
        const [attrName, id, className] = String(data).split('.');
        const {master} = this.meta;
        master.class = this.baseMeta.getClass(className);
        if (!master.class) {
            throw new BadRequest(`Master class not found: ${data}`);
        }
        master.view = master.class;
        master.attr = master.view.getAttr(attrName);
        if (!master.attr) {
            throw new BadRequest(`Master attribute not found: ${data}`);
        }
        if (!master.attr.relation) {
            throw new BadRequest(`Invalid master relation: ${data}`);
        }
        const config = this.getSpawnConfig();
        if (!id) {
            master.model = master.view.createModel(config);
            return master.model;
        }
        const query = master.view.createQuery(config).byId(id);
        master.model = await query.one();
        if (!master.model) {
            throw new NotFound(`Master model not found: ${data}`);
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
        node = this.navMeta.getNode(node, this.module.getRouteName());
        if (!node) {
            throw new NotFound('Node not found');
        }
        const cls = this.baseMeta.getClass(node.data.class);
        this.meta.node = node;
        this.meta.class = cls;
        this.meta.view = cls?.getView(node.data.view || params.viewName) || cls;
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
        const errors = model.getFirstErrorMap();
        const messages = this.translateMessageMap(errors);
        const data = {[model.class.name]: messages};
        this.send(data, Response.BAD_REQUEST);
    }

    async renderMeta (template, params) {
        return this.render(template, Object.assign(params, {
            hasUtility: await this.hasUtility()
        }));
    }

    hasUtility () {
        const manager = this.module.get('utility');
        return manager.isActiveUtility({
            controller: this,
            modelAction: this.action.name
        });
    }

    log (type, message, data) {
        message = this.meta.view ? `${this.meta.view.id}: ${message}` : message;
        this.baseMeta.log(type, message, data);
    }
};

const BadRequest = require('areto/error/http/BadRequest');
const NotFound = require('areto/error/http/NotFound');
const MetaParams = require('evado/component/meta/MetaParams');
const MetaTransit = require('evado/component/meta/MetaTransit');
const MetaSecurity = require('evado/component/meta/MetaSecurity');
const Response = require('areto/web/Response');