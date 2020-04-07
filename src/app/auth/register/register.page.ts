import {Component, OnInit, ViewChild} from '@angular/core';
import {LanguageService} from '../../../services/language/language.service';
import {IonInput, ModalController, NavController} from '@ionic/angular';
import {Country, UserData} from '../../../interface/interface';
import {CountriesService} from '../../../services/countries/countries.service';
import {CountriesModalPage} from '../../modals/countries-modal/countries-modal.page';
import {UtilsService} from "../../../services/utils/utils.service";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  @ViewChild('inputFullName', null) inputFullName: IonInput;
  @ViewChild('inputEmail', null) inputEmail: IonInput;
  @ViewChild('inputPassword', null) inputPassword: IonInput;
  @ViewChild('inputConfirmPassword', null) inputConfirmPassword: IonInput;
  @ViewChild('inputPhoneNumber', null) inputPhoneNumber: IonInput;

  country: Country;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  rememberMe: boolean;
  acceptTerms: boolean;

  constructor(
      private http: HttpClient,
      private navController: NavController,
      private modalController: ModalController,
      private language: LanguageService,
      private countryService: CountriesService,
      private utils: UtilsService
  ) { }

  async ngOnInit() {
    this.country = this.countryService.getCountry();
    this.fullName = '';
    this.email = '';
    this.password = '';
    this.confirmPassword = '';
    this.phoneNumber = '';
    this.rememberMe = false;
    this.acceptTerms = false;
    this.country = await this.countryService.geocodeLocation();
    
  }

  openCountriesModal() {
    this.modalController.create({
      component: CountriesModalPage
    }).then(async modal => {
      modal.onDidDismiss().then(callback => {
        if (callback.data) {
          this.country = callback.data;
        }
      });
      await modal.present();
    });
  }

  toggleRememberMe() {
    this.rememberMe = !this.rememberMe;
  }

  toggleAcceptTerms() {
    this.acceptTerms = !this.acceptTerms;
  }

  navigateToLogin() {
    this.navController.navigateBack('/auth').then(() => {});
  }

  registerButtonClicked() {
    if (this.fullName === '') {
      console.log(this.country)
      this.utils.showToast('Your full name is required').then(async () => {
        await this.inputFullName.setFocus();
      });
    } else if (this.email === '') {
      this.utils.showToast('Your email address is required').then(async () => {
        await this.inputEmail.setFocus();
      });
    } else if (this.password === '') {
      this.utils.showToast('Your password is required').then(async () => {
        await this.inputPassword.setFocus();
      });
    } else if (this.password && this.confirmPassword !== this.password) {
      this.utils.showToast('Confirm password is not match').then(async () => {
        await this.inputConfirmPassword.setFocus();
      });
    } else if (this.phoneNumber === '') {
      this.utils.showToast('Your phone number is required').then(async () => {
        await this.inputPhoneNumber.setFocus();
      });
    } else {
      this.utils.showLoading().then(loading => {
        const user: UserData = {
          name: this.fullName,
          email: this.email,
          password: this.password,
          country_code: this.country.countryCode,
          dial_code: this.country.dialCode.toString(),
          phone: Number(this.phoneNumber),
          user_level: 1
        };
        this.http.post(environment.authApi + 'register', {...user}).subscribe((response: any) => {
          console.log(response);
          this.utils.showToast(response.message).then(async () => {
            loading.dismiss();
            if (response.status === 'success') {
              localStorage.setItem('confirmType', 'verify');
              await this.navController.navigateForward('/auth/confirmation');
            }
          });
        });
      });
    }
  }

}
