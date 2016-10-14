angular
    .module('bit', [
        'ui.router',
        'ngAnimate',
        'toastr',
        'angulartics',

        'bit.directives',
        'bit.services',

        'bit.global',
        'bit.accounts',
        'bit.current',
        'bit.vault',
        'bit.settings',
        'bit.tools'
    ]);
