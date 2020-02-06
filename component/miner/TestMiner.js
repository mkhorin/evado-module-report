/**
 * @copyright Copyright (c) 2020 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('evado-meta-report/base/BaseMiner');

module.exports = class TestMiner extends Base {

    async run () {
        await this.constructor.delay(1000);
        await this.deleteData();

        const streetClass = this.docMeta.getClass('street');
        const streets = await streetClass.find().raw().all();
        const result = streets.map(data => ({
            a: data.name,
            b: `test-${data.name}`
        }));
        await this.insertData(result);
        return this.constructor.delay(10000);
    }
};