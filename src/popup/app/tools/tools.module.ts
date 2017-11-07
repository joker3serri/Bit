import * as angular from 'angular';
import { ToolsComponent } from './tools.component';
import { PasswordGeneratorComponent } from './password-generator.component';

export default angular
    .module('bit.tools', ['ngAnimate', 'ngclipboard', 'toastr', 'oitozero.ngSweetAlert'])

    .component('tools', ToolsComponent)
    .component('passwordGenerator', PasswordGeneratorComponent)

    .name;
