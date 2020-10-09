/**
 * @copyright Copyright (c) 2020 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

module.exports = {

    title: 'Report',

    components: {
        'miner': {
            Class: require('../component/miner/MinerManager')
        },
        'extraMeta': {
            Class: require('../component/meta/ExtraMeta')
        }
    },
    params: {
        // defaultUrl: 'report/model?n=[item].[section]'
    },
    classes: require('./default-classes'),
    widgets: {
        'sideMenu': {
            Class: require('../component/widget/SideMenu')
        }
    },
    tasks: require('./default-tasks')
};