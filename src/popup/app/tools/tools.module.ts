import * as angular from 'angular';
import { ToolsController } from './tools.controller';

export default angular
    .module('bit.tools', ['ngAnimate', 'ngclipboard', 'toastr', 'oitozero.ngSweetAlert'])
    .controller('toolsController', ToolsController) 
    .name;
