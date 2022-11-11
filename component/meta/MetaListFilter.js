/**
 * @copyright Copyright (c) 2020 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('evado/component/misc/ListFilter');

module.exports = class MetaListFilter extends Base {

    parse (data) {
        const attr = this.report.getAttr(data.attr);
        if (this.report.searchAttrs.includes(attr)) {
            return super.parse(data);
        }
        const message = `Invalid search attribute: ${data.attr}.${this.report.id}`;
        throw new BadRequest(this.wrapClassMessage(message));
    }
};

const BadRequest = require('areto/error/http/BadRequest');