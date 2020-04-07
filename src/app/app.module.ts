import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {CountriesModalPageModule} from './modals/countries-modal/countries-modal.module';
import {IonicRatingModule} from 'ionic-rating';
import {NgCircleProgressModule} from 'ng-circle-progress';
import {BreathingExercisePageModule} from './modals/breathing-exercise/breathing-exercise.module';
import {HttpClientModule} from '@angular/common/http';
import {MindfulExercisePageModule} from './modals/mindful-exercise/mindful-exercise.module';
import {CallModalPageModule} from './modals/call-modal/call-modal.module';
import * as firebase from 'firebase';
import {environment} from '../environments/environment';

firebase.initializeApp(environment.firebaseConfig);

@NgModule({
    declarations: [
        AppComponent
    ],
    entryComponents: [],
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        HttpClientModule,
        AppRoutingModule,
        IonicRatingModule,
        CountriesModalPageModule,
        BreathingExercisePageModule,
        MindfulExercisePageModule,
        CallModalPageModule,
        NgCircleProgressModule.forRoot(),
    ],
    providers: [
        StatusBar,
        SplashScreen,
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy}
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
