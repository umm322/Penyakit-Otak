
Ext.define('otak.store.Personnel', {
    extend: 'Ext.data.Store',
    alias: 'store.personnel',

    model: 'otak.model.Personnel',
    storeId: 'personnel',

    pageSize: 10,
    autoLoad: true,

    proxy: {
        type: 'ajax',
        url: 'app/Data/brain.json',
        reader: {
            type: 'json',
            rootProperty: ''
        }
    },

    remoteSort: false,
    remoteFilter: false
});
