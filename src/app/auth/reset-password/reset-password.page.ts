import { Component, OnInit } from '@angular/core';
import {NavController} from '@ionic/angular';
import {LanguageService} from '../../../services/language/language.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {

  constructor(
      private navController: NavController,
      private language: LanguageService
  ) { }

  ngOnInit() {
  }

  navigateToForgotPassword() {
    this.navController.navigateBack('/auth/forgot-password');
  }

  navigateToConfirm() {
    localStorage.setItem('confirmType', 'reset');
    this.navController.navigateForward('/auth/confirmation');
  }

}
