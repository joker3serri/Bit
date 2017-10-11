angular
    .module('bit.components')
    .component('favicon', {
    	bindings: {
    		uri: '<'
    	},
        template: '<div class="favicon" ng-if="$ctrl.enabled()"><img src="{{$ctrl.url}}"></div>',
        controller: function(faviconService) {
            this.$onInit = (function() {
        		this.enabled = faviconService.enabled;
            	this.url = faviconService.getIconUrl(this.uri);
            }).bind(this);
        }
    });
