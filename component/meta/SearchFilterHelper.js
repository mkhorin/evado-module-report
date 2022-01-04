/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('areto/base/Base');

module.exports = class SearchFilterHelper extends Base {

    static getColumns (cls, depth) {
        const columns = [];
        for (const attr of cls.searchAttrs) {
            columns.push(this.getColumn(attr, depth));
        }
        return columns;
    }

    static getColumn (attr, depth) {
        if (attr.relation) {
            return this.getRelationData(attr, depth);
        }
        if (attr.enum) {
            return this.getEnumData(attr);
        }
        return this.getDefaultData(attr);
    }

    static getDefaultData (attr) {
        return {
            name: attr.name,
            label: attr.getLabel(),
            type: this.getAttrType(attr),
            format: attr.getFormat(),
            utc: attr.isUTC()
        };
    }

    static getAttrType (attr) {
        if (attr.isNumber()) {
            return 'number';
        }
        return attr.getType();
    }

    static getRelationData (attr, depth = attr.searchDepth) {
        const data = this.getDefaultData(attr);
        if (depth > 0 && attr.relation.refClass) {
            data.columns = this.getColumns(attr.relation.refClass, depth - 1);
        }
        data.id = attr.id;
        data.type = 'selector';
        return data;
    }

    static getEnumData (attr) {
        const data = this.getDefaultData(attr);
        data.type = 'selector';
        data.items = attr.enum.data[0].items;
        return data;
    }
};