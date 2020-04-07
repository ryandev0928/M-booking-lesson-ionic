import {Component, OnInit, ViewChild} from '@angular/core';
import {LanguageService} from '../../../services/language/language.service';
import {IonInput, NavController} from '@ionic/angular';
import {UtilsService} from '../../../services/utils/utils.service';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {DeviceInfo} from '../../../interface/interface';

@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

    @ViewChild('inputEmail', null) inputEmail: IonInput;
    @ViewChild('inputPassword', null) inputPassword: IonInput;

    email: string;
    password: string;

    constructor(
        private http: HttpClient,
        private navController: NavController,
        private language: LanguageService,
        private utils: UtilsService
    ) {
    }

    ngOnInit() {
        this.email = '';
        this.password = '';
    }

    navigateToLanguage() {
        this.navController.navigateBack('/language').then(() => {
        });
    }

    navigateToForgotPassword() {
        this.navController.navigateForward('/auth/forgot-password').then(() => {
        });
    }

    navigateToRegister() {
        this.navController.navigateForward('/auth/register').then(() => {
        });
    }

    loginButtonClicked() {
        if (this.email === '') {
            this.utils.showToast('Your email address is required').then(async () => {
                await this.inputEmail.setFocus();
            });
        } else if (this.password === '') {
            this.utils.showToast('Your password is required').then(async () => {
                await this.inputPassword.setFocus();
            });
        } else {
            this.utils.showLoading().then(loading => {
                const deviceInfo: DeviceInfo = JSON.parse(localStorage.getItem('deviceInfo'));
                const data = {
                    email: this.email,
                    password: this.password,
                    ...deviceInfo
                };
                this.http.post(environment.authApi + 'login', {...data}).subscribe((response: any) => {
                    loading.dismiss();
                    this.utils.showToast(response.message).then(async () => {
                        if (response.status === 'success') {
                            localStorage.setItem('confirmType', 'start');
                            await this.navController.navigateForward('/auth/confirmation');
                        }
                    });
                });
            });
        }
    }

}
