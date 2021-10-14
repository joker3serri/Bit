import { Injectable } from '@angular/core';
import {
    CanActivate,
    Router,
} from '@angular/router';

import { UnauthGuardService } from 'jslib-angular/services/unauth-guard.service';

@Injectable()
export class LaunchGuardService implements CanActivate {
    constructor(private router: Router, private unauthGuardService: UnauthGuardService) { }

    async canActivate() {
        return await this.unauthGuardService.canActivate();
    }
}
