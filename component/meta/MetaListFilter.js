/**
 * @copyright Copyright (c) 2020 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('evado/component/other/ListFilter');

module.exports = class MetaListFilter extends Base {

    parse (data) {
        const attr = this.report.getAttr(data.attr);
        if (this.report.searchAttrs.includes(attr)) {
            return super.parse(data);
        }
        throw new BadRequest(this.wrapClassMessage(`Invalid search attribute: ${data.attr}.${this.report.id}`));
    }
};

const BadRequest = require('areto/error/http/BadRequest');