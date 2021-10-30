/**
 * @copyright Copyright (c) 2020 Maxim Khorin (maksimovichu@gmail.com)
 */
'use strict';

const Base = require('areto/base/Component');

module.exports = class ExtraMeta extends Base {

    init () {
        this.metaHub = this.module.getMetaHub();
        this.metaHub.onAfterLoad(() => {
            this.prepare(this.metaHub.get('report'));
        });
    }

    getData ({id}) {
        return ObjectHelper.getValue(id, this._data);
    }

    getPageTitle ({node, view}) {
        return node.data.label || view?.data.label || node.title;
    }

    // REPORT

    prepare (meta) {
        try {
            this._data = {};
            meta.reports.forEach(this.prepareReport, this);
        } catch (err) {
            this.log('error', err);
        }
    }

    prepareReport (item) {
        this._data[item.id] = this.getReportData(item);
    }

    getReportData (item) {
        return {
            columns: this.getGridColumns(item),
            filterColumns: SearchFilterHelper.getColumns(item.searchAttrs)
        };
    }

    getGridColumns (report) {
        const columns = [];
        if (!report.hasKeyAttr()) {
            columns.push(this.getKeyGridColumn(report));
        }
        for (const attr of report.attrs) {
            columns.push(this.getGridColumn(attr));
        }
        return columns;
    }

    getKeyGridColumn (report) {
        return {
            name: report.getKey(),
            label: 'ID',
            searchable: true,
            sortable: true,
            hidden: true
        };
    }

    getGridColumn (attr) {
        return {
            name: attr.name,
            label: attr.getLabel(),
            type: attr.getType(),
            searchable: attr.data.commonSearchable,
            sortable: attr.data.sortable,
            format: attr.getFormat(),
            hidden: attr.isHidden()
        };
    }
};

const ObjectHelper = require('areto/helper/ObjectHelper');
const SearchFilterHelper = require('./SearchFilterHelper');