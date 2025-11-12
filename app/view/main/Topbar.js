Ext.define('otak.view.main.Topbar', {
    extend: 'Ext.Toolbar',
    xtype: 'app-topbar',

    style: {
        background: '#1e1e1e',
        padding: '10px 20px',
        borderBottom: '1px solid #333'
    },

    items: [
        { xtype: 'component', html: '<h3 style="color:#00b4d8;">Brain Data Overview</h3>' },
        '->',
        { xtype: 'button', text: 'Refresh', iconCls: 'x-fa fa-sync', ui: 'alt' }
    ]
});
