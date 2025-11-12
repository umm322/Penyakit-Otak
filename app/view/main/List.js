
Ext.define('otak.view.main.List', {
  extend: 'Ext.Container',
  xtype: 'mainlist',

  requires: ['otak.store.Personnel'],

  layout: 'vbox',
  padding: 10,

  items: [
    {
      xtype: 'grid',
      reference: 'diseaseGrid',
      flex: 1,
      store: { type: 'personnel' },
      columns: [
        { text: 'Letter', dataIndex: 'Letter', width: 70 },
        { text: 'Disease Name', dataIndex: 'Disease_Name', flex: 1 },
        { text: 'Category', dataIndex: 'Category', width: 180 },
        { text: 'Description', dataIndex: 'Description', flex: 2 },
        { text: 'Prevalence', dataIndex: 'Prevalence_Range', width: 150 },
        {
          text: 'Source',
          dataIndex: 'Source_URL',
          flex: 1,
          renderer: v => v
            ? `<a href="${v}" target="_blank" style="color:#007aff;text-decoration:none;">View Source</a>`
            : `<span style="color:gray;">No source</span>`
        }
      ],

      listeners: {
        painted(grid) {
          const store = grid.getStore();
          const pageSize = 10;
          let currentPage = 1;

          const updatePage = () => {
            const start = (currentPage - 1) * pageSize;
            const end = start + pageSize;
            const pageData = store.getRange(start, end);
            grid.getStore().loadData(pageData, false);
          };

          store.on('load', updatePage);
          grid.pagination = { currentPage, pageSize, updatePage, store };
        }
      }
    },
    {
      xtype: 'container',
      layout: 'hbox',
      defaults: {
        margin: '8 8 0 8',
        flex: 1
      },
      items: [
        {
          xtype: 'button',
          text: '⟵ Prev',
          handler(btn) {
            const grid = btn.up('mainlist').lookupReference('diseaseGrid');
            const pg = grid.pagination;
            if (pg.currentPage > 1) {
              pg.currentPage--;
              pg.updatePage();
            }
          }
        },
        {
          xtype: 'button',
          text: 'Next ⟶',
          handler(btn) {
            const grid = btn.up('mainlist').lookupReference('diseaseGrid');
            const pg = grid.pagination;
            const totalPages = Math.ceil(pg.store.getCount() / pg.pageSize);
            if (pg.currentPage < totalPages) {
              pg.currentPage++;
              pg.updatePage();
            }
          }
        }
      ]
    }
  ]
});
