Ext.define('otak.view.main.MainController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.main',

    onSearchChange: function (field, newValue) {
        const grid = field.up('grid');
        const store = grid.getStore();

        store.clearFilter();

        if (newValue) {
            const search = newValue.toLowerCase();
            store.filterBy(function (record) {
                return record.get('Disease_Name').toLowerCase().includes(search) ||
                       record.get('Category').toLowerCase().includes(search);
            });
        }
    }
});
