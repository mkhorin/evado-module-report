/**
 * @copyright Copyright (c) 2020 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

const Base = require('../component/base/BaseActiveRecord');

const STATE_PENDING = 'pending';
const STATE_PROCESSING = 'processing';
const STATE_READY = 'ready';
const STATE_ERROR = 'error';

module.exports = class Model extends Base {

    static getConstants () {
        return {
            TABLE: 'sys_report',
            ATTRS: [
                'state',
                'name',
                'label',
                'report',
                'createdAt',
                'creator'
            ],
            RULES: [
                [['name', 'label'], 'string', {min: 2, max: 32}],
                ['name', 'regex', {pattern: /^[0-9a-zA-Z-]+$/}],
                [['name', 'label'], 'unique'],
                ['state', 'default', {value: STATE_PENDING}]
            ],            
            BEHAVIORS: {
                'timestamp': require('areto/behavior/TimestampBehavior'),
                'userStamp': require('areto/behavior/UserStampBehavior')
            },
            UNLINK_ON_DELETE: [
            ],            
            ATTR_LABELS: {
                'report': 'Report class'
            },
            ATTR_VALUE_LABELS: {
                'state': {
                    [STATE_PENDING]: 'Pending',
                    [STATE_PROCESSING]: 'Processing',
                    [STATE_READY]: 'Ready',
                    [STATE_ERROR]: 'Error'
                }
            },
            QUERY_CLASS: require('../query/ModelQuery'),
            STATE_PENDING,
            STATE_PROCESSING,
            STATE_READY,
            STATE_ERROR
        };
    }

    isPending () {
        return this.get('state') === STATE_PENDING;
    }

    isProcessing () {
        return this.get('state') === STATE_PROCESSING;
    }

    isReady () {
        return this.get('state') === STATE_READY;
    }

    isError () {
        return this.get('state') === STATE_ERROR;
    }

    getMeta () {
        return this.module.getMetaHub().get('report');
    }

    getMetaReport () {
        return this.getMeta().getReport(this.get('report'));
    }

    relCreator () {
        const Class = this.getClass('model/User');
        return this.hasOne(Class, Class.PK, 'creator');
    }

    saveProcessingState () {
        this.set('state', STATE_PROCESSING);
        return this.forceSave();
    }

    saveReadyState () {
        this.set('state', STATE_READY);
        return this.forceSave();
    }

    saveErrorState () {
        this.set('state', STATE_ERROR);
        return this.forceSave();
    }

    async afterSave (insert) {
        if (insert) {
            await this.module.get('miner').executeMiningTask();
        }
        await super.afterSave(insert);
    }

    async afterDelete () {
        await this.deleteData(); // delete report data
        await this.module.get('miner').deleteMiner(this);
        await super.afterDelete();
    }

    deleteData () {
        return this.getMetaReport().createQuery(this.getSpawnConfig()).byOwner(this.getId()).delete();
    }
};
module.exports.init(module);