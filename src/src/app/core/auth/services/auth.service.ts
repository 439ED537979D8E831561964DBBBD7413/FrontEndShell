import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { OidcService } from './oidc.service';
import { UserProfile } from '../model/user-profile';
import { LoggerService } from '../../base/logger/logger.service';

import { CommonService } from '../../base/utils/common.service';
import { EnumType } from '../../base/utils/interfaces';
import { AuthorizationService } from '../pages-access-authorization/authorization.service';
import { StorageService } from '../../base/storage/storage.service';

import { PageLoaderService } from '../../components/page-loader/page-loader.service';
import { ToastrService } from '../../../shared/components/toastr/toastr.service';

import swal from 'sweetalert2';
import Sweetalert2 from 'sweetalert2';

@Injectable()
export class AuthService {
    // store the URL so we can redirect after logging in
    private redirectUrl: string;
    private storageKey = 'userProfileStorage';
    userProfile: UserProfile;
    // Create a stream of logged in status to communicate throughout app
    loggedIn: boolean;
    loggedIn$ = new BehaviorSubject<boolean>(this.loggedIn);

    constructor(
        private router: Router,
        private oidcService: OidcService,
        private authorizationService: AuthorizationService,
        private logger: LoggerService,
        private storageService: StorageService,
        private Common: CommonService,
        private toasrtService: ToastrService,
        private pageLoader: PageLoaderService) {

        this.userProfile = this.getUserProfile() || new UserProfile();
        this.logger.log('userProfile: ', this.userProfile);

        // If authenticated, set local profile property and update login status subject
        if (this.userProfile.authClient && this.userProfile.authClient !== '') {
            this.oidcService.createNewOidcUserManagerInstance(this.userProfile.authClient, this.eventsCallback.bind(this));
            this.setLoggedIn(true);
        } else {
            this.setLoggedIn(false);
        }
    }

    private getUserProfile(): UserProfile {
        const userProfile = this.storageService.getItem(this.storageKey);
        if (userProfile) {
            return JSON.parse(userProfile);
        }
        return null;
    }

    setLoggedIn(value: boolean) {
        // Update login status subject
        this.loggedIn$.next(value);
        this.loggedIn = value;
    }

    async login(authClient: string, redirectUrl: string) {
        try {
            this.pageLoader.setLoading(true);
            await this.oidcService.signin(authClient, redirectUrl);
            this.logger.log('signinRedirect done');

        } catch (error) {
            this.toasrtService.error(error, 'Login Failed.', { timeOut: 5000 });
            this.pageLoader.setLoading(false);
            this.logger.log(`oidcService login failed: ${error}`);
            throw error;

        }

    }

    async loginRedirectCallback(): Promise<any> {
        const oidcUserModel = await this.oidcService.signinRedirectCallback(this.eventsCallback.bind(this));
        this.logger.log(`signin response success: `, oidcUserModel);
        this.setSession(oidcUserModel);
        const accessAuthorizationretrieved = await this.authorizationService.getPagesAccessAuthorization().toPromise();
        return new Promise((resolve, reject) => {
            accessAuthorizationretrieved === true ? resolve(oidcUserModel.state) : reject('accessAuthorizationretrieved false');
        });
    }
    setSession(oidcUserModel) {
        const userProfile: UserProfile = this.toUserProfileModelMapper(oidcUserModel);
        this.logger.log('userProfile: ', this.userProfile);
        this.setUserProfile(userProfile);
        this.setLoggedIn(true);
    }
    async logout() {
        try {
            this.pageLoader.setLoading(true);
            const resp = await this.oidcService.signout(this.userProfile.id_token);
            this.reset();
            this.authorizationService.remove();
            this.setLoggedIn(false);
            this.logger.log(`signed out: ${resp}`);
        } catch (error) {
            this.toasrtService.error(error, 'logout Failed.', { timeOut: 5000 });
            this.pageLoader.setLoading(false);
            this.logger.log(`signoutRedirect failed: ${error} `);
        }
    }

    private reset() {
        this.storageService.removeItem(this.storageKey);
        this.userProfile.reset();
    }

    private toUserProfileModelMapper(oidcUserModel): UserProfile {

        const identityUserRoles = oidcUserModel.profile['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        const identityUserEmailAddress = oidcUserModel.profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
        const identityUserName = oidcUserModel.profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
        const roles = this.getRoles(identityUserRoles);

        const userProfile = new UserProfile();
        userProfile.authClient = oidcUserModel.state.authClient;
        userProfile.username = identityUserName;
        userProfile.email = identityUserEmailAddress;
        userProfile.id_token = oidcUserModel.id_token;
        userProfile.access_token = oidcUserModel.access_token;
        userProfile.roles = roles;

        this.logger.info(`toUserProfileModelMapper --> userProfile `, userProfile);
        return userProfile;
    }
    private setUserProfile(userProfile: UserProfile) {
        this.storageService.setItem(this.storageKey, JSON.stringify(userProfile));
        this.userProfile = userProfile;
    }

    private getRoles(oidcUserRoles): string[] {
        let roleResults = [];
        if (Array.isArray(oidcUserRoles)) {
            roleResults = oidcUserRoles;
        } else
            if (typeof oidcUserRoles === 'string') {
                roleResults = [oidcUserRoles];
            }

        return roleResults;
    }


    eventsCallback(eventName: string) {

        this.logger.log(`eventsCallback ${eventName}`);

        switch (eventName) {
            case 'token expired':

                swal({
                    title: 'Token Expired',
                    text: 'Your token has been expired!',
                    type: 'warning',
                    confirmButtonText: 'Logout',
                    allowOutsideClick: false
                }).then((result) => {
                    if (result.value) {
                        this.logout();

                    }
                });
                break;
        }
    }
}
