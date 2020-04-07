import { Component, OnInit } from '@angular/core';
import {NavController} from '@ionic/angular';
import {LanguageService} from '../../../services/language/language.service';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {UserData} from '../../../interface/interface';
import {UtilsService} from '../../../services/utils/utils.service';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.page.html',
  styleUrls: ['./confirmation.page.scss'],
})
export class ConfirmationPage implements OnInit {

  texts: any;
  type: string;
  userName: string;

  constructor(
      private navController: NavController,
      private language: LanguageService,
      private http: HttpClient,
      private utils: UtilsService
  ) { }

  ngOnInit() {
    // this.getUserProfile();
    this.texts = {
      reset: {
        text: this.language.getWordByLanguage('resetConfirm'),
        button: 'OK'
      },
      verify: {
        text: this.language.getWordByLanguage('needVerify'),
        button: 'OK'
      },
      start: {
        text: this.language.getWordByLanguage('startQuestion'),
        button: this.language.getWordByLanguage('start')
      }
    };
    this.type = localStorage.getItem('confirmType');
  }

  navigateByType() {
    if (this.type === 'start') {
      this.navController.navigateForward('/tabs/prepare-survey');
    } else {
      this.navController.navigateBack('/auth');
    }
  }

  navigateToMain() {
    this.navController.navigateForward('/tabs');
  }

  async getUserProfile(): Promise<any> {
    return new Promise(resolve => {
        const deviceInfo = JSON.parse(localStorage.getItem('deviceInfo'));
        this.http.get(environment.userApi + 'user_profile', {
            params: {...deviceInfo}
        }).subscribe((response: any) => {
            const user = response.user as UserData;
            this.userName = user.name;
            resolve({userName: this.userName});
        });
    });
  }

  ionViewWillEnter() {
    this.getUserProfile();
  }

}
