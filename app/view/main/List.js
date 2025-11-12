Ext.define('otak.view.main.List', {
    extend: 'Ext.grid.Grid',
    xtype: 'mainlist',

    requires: [
        'otak.store.Personnel'
    ],

    store: {
        type: 'personnel'
    },

    title: 'Disease Database',

    tbar: [{
        xtype: 'textfield',
        reference: 'searchField',
        placeholder: 'Search by name or category...',
        flex: 1,
        clearable: true,
        listeners: {
            change: 'onSearchChange'
        }
    }, {
        xtype: 'button',
        text: 'Reload',
        iconCls: 'x-fa fa-sync',
        handler: function (btn) {
            btn.up('grid').getStore().reload();
        }
    }],

    columns: [
        { text: 'Letter', dataIndex: 'Letter', width: 70 },
        { text: 'Disease Name', dataIndex: 'Disease_Name', flex: 1 },
        { text: 'Category', dataIndex: 'Category', width: 180 },
        { text: 'Description', dataIndex: 'Description', flex: 2 },
        { text: 'Prevalence', dataIndex: 'Prevalence_Range', width: 150 },
        {
            text: 'Source',
            dataIndex: 'Source_Url',
            flex: 1,
            renderer: function (value) {
                return `<a href="${value}" target="_blank">View Source</a>`;
            }
        }
    ],

    listeners: {
        painted: function (grid) {
            grid.getStore().load();
        }
    },

    itemConfig: {
        body: {
            cls: 'x-grid-row-body',
            style: 'padding: 10px;'
        }
    }
});
