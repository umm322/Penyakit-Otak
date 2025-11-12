Ext.define('otak.view.main.Sidebar', {
    extend: 'Ext.Container',
    xtype: 'app-sidebar',

    layout: { type: 'vbox', align: 'stretch' },
    style: {
        background: 'linear-gradient(180deg, #1a1a1a 0%, #101010 100%)',
        boxShadow: '2px 0 8px rgba(0,0,0,0.4)'
    },

    items: [
        {
            xtype: 'component',
            html: '<h2 style="color:#00b4d8; padding:20px;">Brain Data</h2>'
        },
        {
            xtype: 'button',
            text: 'Dashboard',
            iconCls: 'x-fa fa-home',
            ui: 'alt',
            style: {
                color: '#ccc',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                padding: '12px 20px'
            },
            listeners: {
                mouseover: function(btn){ btn.setStyle('color', '#00b4d8'); },
                mouseout: function(btn){ btn.setStyle('color', '#ccc'); }
            }
        }
    ]
});
