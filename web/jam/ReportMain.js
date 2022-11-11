/**
 * @copyright Copyright (c) 2020 Maxim Khorin <maksimovichu@gmail.com>
 */
'use strict';

Jam.ReportMain = class ReportMain extends Jam.Element {

    constructor ($container) {
        super($container);
        this.$container = $container;
        this.tabs = Jam.Tabs.createInstance($container.children('.tabs'));
        this.tabs.event.on('change', this.onChangeTab.bind(this));

        this.instanceList = Jam.Element.getInstance($container.find('.data-grid'));
        this.instanceList.grid.event.one('afterDrawPage', this.onAfterDrawInstanceList.bind(this));
        this.instanceList.event.one('afterDelete', this.onAfterDeleteInstanceList.bind(this));

        this.showReportAction = $container.find('[data-action="showReport"]');
        this.showReportAction.click(this.onShowReport.bind(this));
    }

    isReadyItem (data) {
        return data.stateCode === 'ready';
    }

    onShowReport () {
        const $item = this.instanceList.getSelectedItem();
        if (!$item) {
            return false;
        }
        const id = $item.data('id');
        const data = this.instanceList.grid.getData(id);
        if (!this.isReadyItem(data)) {
            return this.instanceList.alert.warning('Only for the ready state');
        }
        this.createTab(id, data);
        this.tabs.setActive(id);
    }

    onChangeTab (event, data) {
        if (!this.instanceList) {
            //this.createInstanceList(data.id);
        }
    }

    onAfterDrawInstanceList () {
        const result = this.getFirstReadyStateData();
        if (result) {
            this.createTab(...result);
            const item = this.instanceList.findItemById(result[0]);
            this.instanceList.toggleItemSelect(item, true);
        }
    }

    onAfterDeleteInstanceList (event, data) {
        data.ids.forEach(this.tabs.deleteTab, this.tabs);
        this.tabs.setActiveFirst();
    }

    createTab (id, data) {
        const template = this.getTemplate('report');
        this.tabs.appendTab(id, {
            text: data.label || data.name || data.createdAt,
            hint: data.createdAt,
            content: Jam.Helper.resolveTemplate(template, {ownerId: id}),
            close: true
        });
    }

    getFirstReadyStateData () {
        for (const item of this.instanceList.grid.items) {
            if (this.isReadyItem(item)) {
                return [item._id, item];
            }
        }
    }

    getTemplate (id) {
        return Jam.Helper.getTemplate(id, this.$container);
    }
};