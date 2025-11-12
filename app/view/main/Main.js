Ext.define('otak.view.main.Main', {
    extend: 'Ext.Container',
    xtype: 'app-main',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    padding: 20,
    scrollable: true,

    items: [
        {
            xtype: 'toolbar',
            docked: 'top',
            style: {
                'background-color': '#2b2d42',
                'color': '#fff',
                'padding': '10px',
                'font-size': '22px',
                'font-weight': '600',
                'margin-bottom': '15px'
            },
            items: [
                {
                    xtype: 'component',
                    html: '<div style="color:#fff;">Brain Disease Data</div>'
                },
                { xtype: 'spacer' },
                {
                    xtype: 'button',
                    text: 'Reload Data',
                    ui: 'action',
                    iconCls: 'x-fa fa-sync',
                    style: {
                        'background-color': '#4cc9f0',
                        'color': '#fff',
                        'border-radius': '6px',
                        'font-weight': '500'
                    },
                    handler: function () {
                        const store = Ext.getStore('personnel');
                        store.load();
                    }
                }
            ]
        },
        {
            xtype: 'textfield',
            reference: 'searchField',
            placeholder: 'Search by name or category...',
            clearable: true,
            height: 36,
            width: 250,
            style: {
                'border-radius': '6px',
                'background-color': '#fff',
                'color': '#000',
                'margin-bottom': '10px'
            },
            listeners: {
                change: function (field, newValue) {
                    const grid = field.up('app-main').down('grid');
                    const store = Ext.getStore('personnel');

                    store.clearFilter();
                    if (newValue) {
                        const val = newValue.toLowerCase();
                        store.filterBy(rec => {
                            return (
                                rec.get('Disease_Name').toLowerCase().includes(val) ||
                                rec.get('Category').toLowerCase().includes(val)
                            );
                        });
                    }
                    
                    grid.currentPage = 1;
                    grid.updatePagination();
                }
            }
        },

        {
            xtype: 'grid',
            reference: 'diseaseGrid',
            height: 500,
            maxHeight: 500,
            scrollable: true,
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
                    dataIndex: 'Source_URL',
                    flex: 1,
                    renderer: function (value) {
                        if (!value) return '<span style="color:gray;">No source</span>';
                        return `<a href="${value}" target="_blank" style="color:#007aff;text-decoration:none;">View Source</a>`;
                    }
                }
            ],
            listeners: {
                painted: function (grid) {
                    grid.currentPage = 1;
                    grid.pageSize = 10;

                    grid.updatePagination = function () {
                        const store = Ext.getStore('personnel');
                        const allRecords = store.getRange(); // ambil dari store yg udah ke-filter

                        const total = allRecords.length;
                        const start = (grid.currentPage - 1) * grid.pageSize;
                        const end = start + grid.pageSize;
                        const pageRecords = allRecords.slice(start, end);

                        const pageStore = new Ext.data.Store({
                            model: 'otak.model.Personnel',
                            data: pageRecords.map(r => r.getData())
                        });
                        grid.setStore(pageStore);

                        const container = grid.up('app-main');
                        const totalPages = Math.ceil(total / grid.pageSize);
                        const prevBtn = container.down('#prevPageBtn');
                        const nextBtn = container.down('#nextPageBtn');
                        const pageText = container.down('#pageText');

                        prevBtn.setDisabled(grid.currentPage <= 1);
                        nextBtn.setDisabled(grid.currentPage >= totalPages);
                        pageText.setHtml(`Page ${grid.currentPage} of ${totalPages}`);
                    };

                    const store = Ext.getStore('personnel');
                    if (store.isLoaded()) {
                        grid.updatePagination();
                    } else {
                        store.on('load', () => grid.updatePagination());
                    }
                },

                childtap: function (grid, location) {
                    const target = location.event.target;
                    if (target.tagName === 'A') {
                        window.open(target.href, '_blank');
                        location.event.stopEvent();
                    }
                }
            }
        },

        {
            xtype: 'container',
            layout: {
                type: 'hbox',
                align: 'middle',
                pack: 'center'
            },
            margin: '10 0 0 0',
            defaults: {
                margin: '0 10'
            },
            items: [
                {
                    xtype: 'button',
                    text: '⟵ Prev',
                    itemId: 'prevPageBtn',
                    handler: function (btn) {
                        const grid = btn.up('app-main').down('grid');
                        if (grid.currentPage > 1) {
                            grid.currentPage--;
                            grid.updatePagination();
                        }
                    }
                },
                {
                    xtype: 'component',
                    html: 'Page 1',
                    itemId: 'pageText',
                    style: { 'font-weight': '600', 'line-height': '30px' }
                },
                {
                    xtype: 'button',
                    text: 'Next ⟶',
                    itemId: 'nextPageBtn',
                    handler: function (btn) {
                        const grid = btn.up('app-main').down('grid');
                        const store = Ext.getStore('personnel');
                        const totalPages = Math.ceil(store.getRange().length / grid.pageSize);

                        if (grid.currentPage < totalPages) {
                            grid.currentPage++;
                            grid.updatePagination();
                        }
                    }
                }
            ]
        }
    ]
});
