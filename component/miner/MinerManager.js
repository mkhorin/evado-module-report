/**
 * @copyright Copyright (c) 2020 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('areto/base/Component');

module.exports = class MinerManager extends Base {

    constructor (config) {
        super({
            ...config
        });
        this._miners = new DataMap;
    }

    executeMiningTask () {
        return this.module.getScheduler().executeTask('mineReportData');
    }

    getMiner (model) {
        return this._miners.get(model.getId());
    }

    createMinerByModel (model) {
        return this.getMiner(model) || this.createMiner(model);
    }

    createMiner (model) {
        const module = this.module;
        const miner = model.getMetaReport().createMiner({model, module});
        this._miners.set(model.getId(), miner);
        return miner;
    }

    deleteMinerByModel (model) {
        const miner = this.getMiner(model);
        return miner ? this.deleteMiner(miner) : false;
    }

    async deleteMiner (miner) {
        await miner.stop();
        this._miners.unset(miner.model.getId());
    }
};
module.exports.init(module);

const DataMap = require('areto/base/DataMap');