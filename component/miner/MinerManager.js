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
        return this.module.getScheduler().executeTask('mining');
    }

    getMiner (model) {
        return this._miners.get(model.getId());
    }

    createMiner (model) {
        let miner = this.getMiner(model);
        if (!miner) {
            miner = model.getMetaReport().createMiner({
                module: this.module,
                model
            });
            this._miners.set(model.getId(), miner);
        }
        return miner;
    }

    async deleteMiner (model) {
        const miner = this.getMiner(model);
        if (miner) {
            await miner.stop();
            this._miners.unset(model.getId());
        }
    }
};
module.exports.init(module);

const DataMap = require('areto/base/DataMap');