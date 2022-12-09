/**
 * @copyright Copyright (c) 2020 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('evado/component/misc/DataGrid');

module.exports = class MetaGrid extends Base {

    /**
     * @param {Object} config
     * @param {Object} config.query - Query instance
     * @param {Object} config.controller - Controller instance
     */
    constructor (config) {
        super({
            meta: config.controller.meta,
            view: config.controller.getView(),
            ...config
        });
        this.report = this.meta.report;
    }

    async getList () {
        this._result = {};
        this._result.maxSize = await this.query.count();
        this.setOffset();
        this.setLimit();
        this.setOrder();
        this.setCommonSearch();
        //await this.resolveFilter();
        this._result.totalSize = await this.query.count();
        this._models = await this.query.all();
        this._result.items = await this.filterByColumns(this._models);
        return this._result;
    }

    setOrder () {
        const order = this.request.order;
        if (!order) {
            return false;
        }
        for (const name of Object.keys(order)) {
            const attr = this.report.getAttr(name);
            if (attr ? !attr.isSortable() : (name !== this.report.getKey())) {
                throw new BadRequest(`Not sortable attribute: ${name}`);
            }
            if (order[name] !== 1 && order[name] !== -1) {
                throw new BadRequest(`Invalid order: ${name}`);
            }
        }
        if (Object.values(order).length) {
            this.query.order(order);
        }
    }

    setCommonSearch () {
        const value = this.request.search;
        if (typeof value !== 'string' || !value.length) {
            return false;
        }
        const conditions = [];
        for (const attr of this.report.commonSearchAttrs) {
            const condition = attr.getSearchCondition(value);
            if (condition) {
                conditions.push(condition);
            }
        }
        const key = this.report.getKey();
        if (!this.report.commonSearchAttrs.includes(key)) {
            const condition = this.report.key.getCondition(value);
            if (condition) {
                conditions.push(condition);
            }
        }
        conditions.length
            ? this.query.and(['or', ...conditions])
            : this.query.where(['false']);
    }

    getAttrTemplateMap () {
        const data = {};
        for (const attr of this.report.attrs) {
            // data[attr.name] = this.view.getMetaItemTemplate(attr);
        }
        return data;
    }

    async renderModel (model) {
        const result = {};
        await PromiseHelper.setImmediate();
        for (const attr of this.report.attrs) {
            await this.renderCell(attr, model, result);
        }
        if (!this.report.hasKeyAttr()) {
            result[this.report.getKey()] = model.getId();
        }
        return result;
    }

    async renderCell (attr, model, result) {
        const name = attr.name;
        const template = this._attrTemplateMap[name];
        if (!template) {
            return result[name] = this.renderAttr(name, attr, model);
        }
        const content = await this.view.render(template, {attr, model});
        result[name] = `<!--handler: ${name}-->${content}`;
    }

    renderAttr (name, attr, model) {
        if (name === this.ROW_KEY) {
            return model.getId();
        }
        const value = model.title.get(name);
        if (value instanceof Date) {
            return this.renderDateAttr(value, attr);
        }
        if (Array.isArray(value)) {
            return value.join('<br>');
        }
        return this.controller.format(value, attr.getFormat());
    }

    renderDateAttr (value, attr) {
        return this.controller.format(value, 'clientDate', {
            utc: attr.isUTC(),
            format: attr.getFormat()
        });
    }
};

const BadRequest = require('areto/error/http/BadRequest');
const PromiseHelper = require('areto/helper/PromiseHelper');