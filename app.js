/*
 * This file launches the application by asking Ext JS to create
 * and launch() the Application class.
 */
Ext.application({
    extend: 'otak.Application',

    name: 'otak',

    requires: [
        // This will automatically load all classes in the otak namespace
        // so that application classes do not need to require each other.
        'otak.*'
    ],

    // The name of the initial view to create.
    mainView: 'otak.view.main.Main'
});
