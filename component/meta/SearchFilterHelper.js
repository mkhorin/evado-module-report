/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('areto/base/Base');

module.exports = class SearchFilterHelper extends Base {

    static getColumns (searchAttrs, depth) {
        const columns = [];
        for (const attr of searchAttrs) {
            let data = {
                name: attr.name,
                label: attr.getLabel(),
                type: this.getAttrType(attr),
                format: attr.getFormat(),
                utc: attr.isUTC()
            };
            if (attr.relation) {
                depth = depth === undefined ? attr.searchDepth : depth;
                data = this.getRelationData(data, attr, depth);
            } else if (attr.enum) {
                data.type = 'selector';
                data.items = attr.enum.data[0].items;
            }
            if (data) {
                columns.push(data);
            }
        }
        return columns;
    }

    static getAttrType (attr) {
        if (attr.isNumber()) {
            return 'number';
        }
        return attr.getType();
    }

    static getRelationData (data, attr, depth) {
        if (depth > 0 && attr.relation.refClass) {
            data.columns = this.getColumns(attr.relation.refClass.searchAttrs, depth - 1);
        }
        data.id = attr.id;
        data.type = 'selector';
        data.valueType = 'id';
        data.relation = true;
        return data;
    }
};