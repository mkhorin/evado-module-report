/**
 * @copyright Copyright (c) 2020 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('areto/scheduler/Job');

module.exports = class MiningJob extends Base {

    constructor (config) {
        super(config);
        this.Model = this.Model || config.module.getClass('model/Model');
    }

    async execute () {
        await this.executePending();
    }

    async executePending () {
        await PromiseHelper.setTimeout(100);
        const query = this.spawn(this.Model).find().inPendingState();
        const model = await query.one();
        if (model) {
            await this.startMining(model);
            await this.executePending();
        }
    }

    async startMining (model) {
        if (!model.isPending()) {
            throw new Error('Not pending state');
        }
        try {
            const manager = this.module.getMinerManager();
            const miner = manager.createMinerByModel(model);
            await model.saveProcessingState();
            await miner.start();
            const counter = await model.findSelf().count();
            if (counter) {
                await model.saveReadyState();
                const type = miner.constructor.name;
                const id = model.getId();
                const duration = Math.ceil(miner.duration / 1000);
                this.log('info', `Mining done: ${type}: ${id}: duration: ${duration} sec.`);
            } else { // model was deleted during mining
                await model.deleteData();
            }
        } catch (err) {
            this.log('error', err);
            await model.saveErrorState();
        }
    }
};
module.exports.init(module);

const PromiseHelper = require('areto/helper/PromiseHelper');