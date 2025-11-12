Ext.define('otak.store.Personnel', {
    extend: 'Ext.data.Store',
    alias: 'store.personnel',

    model: 'otak.model.Personnel',
    storeId: 'personnel',

    proxy: {
        type: 'ajax',
        url: 'app/data/brain.json',  // path to your JSON file
        reader: {
            type: 'json',
            rootProperty: ''  // make sure your JSON looks like { "items": [ ... ] }
        }
    },

    autoLoad: true
});
