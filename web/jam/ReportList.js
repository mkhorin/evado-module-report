/**
 * @copyright Copyright (c) 2020 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

Jam.ReportList = class ReportList extends Jam.List {

    beforeXhr (event, data) {
        super.beforeXhr(event, data);
        data.request.data.ownerId = this.$grid.data('ownerId');
    }
};