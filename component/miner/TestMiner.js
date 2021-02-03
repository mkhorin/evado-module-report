/**
 * @copyright Copyright (c) 2020 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('evado-meta-report/base/BaseMiner');

module.exports = class TestMiner extends Base {

    async execute () {
        await Base.delay(1000);
        await this.deleteData();

        const streetClass = this.baseMeta.getClass('street');
        const streets = await streetClass.find().raw().all();
        const result = streets.map(data => ({
            a: data.name,
            b: `test-${data.name}`
        }));
        await this.insertData(result);
        return Base.delay(10000);
    }
};