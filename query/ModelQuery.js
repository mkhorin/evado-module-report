/**
 * @copyright Copyright (c) 2020 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('areto/db/ActiveQuery');

module.exports = class ModelQuery extends Base {

    byReport (report) {
        return this.and({report: report.id});
    }

    inPendingState () {
        return this.and({state: Model.STATE_PENDING});
    }

    inProcessingState () {
        return this.and({state: Model.STATE_PROCESSING});
    }

    inReadyState () {
        return this.and({state: Model.STATE_READY});
    }

    inErrorState () {
        return this.and({state: Model.STATE_ERROR});
    }
};

const Model = require('../model/Model');