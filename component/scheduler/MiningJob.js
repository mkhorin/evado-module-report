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
        const model = await this.spawn(this.Model).find().inPendingState().one();
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
            const miner = this.module.getMinerManager().createMinerByModel(model);
            await model.saveProcessingState();
            await miner.start();
            if (await model.findSelf().count()) {
                await model.saveReadyState();
                const duration = `duration: ${Math.ceil(miner.duration / 1000)} sec.`;
                this.log('info', `Mining done: ${miner.constructor.name}: ${model.getId()}: ${duration}`);
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