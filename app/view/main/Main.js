Ext.define('otak.view.main.Main', {
    extend: 'Ext.Container',
    xtype: 'app-main',

    layout: 'vbox',
    padding: 20,
    scrollable: true,

    items: [
        {
            xtype: 'toolbar',
            docked: 'top',
            title: 'Brain Disease Data',
            style: {
                'font-size': '22px',
                'font-weight': '600',
                'margin-bottom': '15px'
            },
            items: [
                { xtype: 'spacer' },
                {
                    xtype: 'button',
                    text: 'Reload Data',
                    ui: 'action',
                    handler: function() {
                        Ext.getStore('personnel').load();
                    }
                }
            ]
        },
        {
            xtype: 'grid',
            flex: 1,
            width: '100%',
            shadow: true,
            border: true,
            store: {
                type: 'personnel'
            },
            style: {
                'background-color': '#ffffff',
                'border-radius': '12px',
                'overflow': 'hidden'
            },
            columns: [
                { text: 'Letter', dataIndex: 'Letter', width: 80 },
                { text: 'Disease Name', dataIndex: 'Disease_Name', flex: 1 },
                { text: 'Category', dataIndex: 'Category', flex: 1 },
                { text: 'Description', dataIndex: 'Description', flex: 2 },
                { text: 'Prevalence Range', dataIndex: 'Prevalence_Range', flex: 1 },
                {
                    text: 'Source',
                    dataIndex: 'Source_Url',
                    flex: 1,
                    renderer: function(value) {
                        return `<a href="${value}" target="_blank" style="color:#007aff;text-decoration:none;">View Source</a>`;
                    }
                }
            ],
            striped: true,
            listeners: {
                painted: function(grid) {
                    grid.getStore().load();
                }
            }
        }
    ]
});
