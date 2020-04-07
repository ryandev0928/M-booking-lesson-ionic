import {Component, ElementRef, ViewChild} from '@angular/core';
import {LanguageService} from '../../../services/language/language.service';
import {ActionSheetController, Events, IonSlides, NavController} from '@ionic/angular';
import {Chart} from 'chart.js';
import {UserInterfaceService} from '../../../services/user-interface/user-interface.service';
import {UtilsService} from '../../../services/utils/utils.service';
import {CameraResultType, CameraSource, Plugins} from '@capacitor/core';
import {UserData} from '../../../interface/interface';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {

    @ViewChild('scoreChart', null) scoreChart: ElementRef;
    @ViewChild('slides', {static: true}) slider: IonSlides;

    segment = 0;
    menuOpened: boolean;

    userName: string;
    profileImage: string;

    microLearning: number;
    coachSession: number;
    toolUsed: number;

    lastScore: number;
    diffLastMonthScore: number;
    absDiffLastMonthScore: number;
    diffFirstScore: number;
    absDiffFirstScore: number;
    chart: Chart;

    constructor(
        private http: HttpClient,
        private events: Events,
        private navController: NavController,
        private actionSheetController: ActionSheetController,
        private utils: UtilsService,
        private language: LanguageService,
        private ui: UserInterfaceService
    ) {
        this.events.subscribe('toggle-side-menu', () => {
            this.toggleSideMenu();
        });
    }

    ionViewWillEnter() {
        this.ui.pageContainerScrollToTop(document.getElementsByClassName('page-container')[0] as HTMLDivElement);

        this.menuOpened = false;

        this.userName = '';
        this.profileImage = '/assets/images/icon_user_avatar.png';

        this.microLearning = 0;
        this.coachSession = 0;
        this.toolUsed = 0;

        this.lastScore = 0;
        this.diffLastMonthScore = 0;
        this.diffFirstScore = 0;

        this.utils.showLoading().then(loading => {
            this.getUserProfile().then(() => {
                this.getUserActivities().then(() => {
                    this.getSurveyScores().then(() => {
                        this.initChart().then(() => {
                            loading.dismiss();
                        });
                    });
                });
            });
        });
    }

    checkScroll(e) {
        if (this.ui.watchPageControllerScrolled(e.target)) {
            this.events.publish('page-not-scrolled');
        } else {
            this.events.publish('page-scrolled');
        }
    }

    async getUserProfile(): Promise<any> {
        return new Promise(resolve => {
            const deviceInfo = JSON.parse(localStorage.getItem('deviceInfo'));
            this.http.get(environment.userApi + 'user_profile', {
                params: {...deviceInfo}
            }).subscribe((response: any) => {
                const user = response.user as UserData;
                this.userName = user.name;
                this.profileImage = user.photo;
                if (!user.photo) {
                    this.profileImage = '/assets/images/icon_user_avatar.png';
                }
                resolve({userName: this.userName, profileImage: this.profileImage});
            });
        });
    }

    async getUserActivities(): Promise<any> {
        return new Promise(resolve => {
            const deviceInfo = JSON.parse(localStorage.getItem('deviceInfo'));
            this.http.get(environment.userApi + 'user_activity', {
                params: {...deviceInfo, type: 'complete-watch-micro-learning'}
            }).subscribe((microLearning: any) => {
                this.microLearning = microLearning.data.length;
                this.http.get(environment.userApi + 'user_activity', {
                    params: {...deviceInfo, type: 'talk-coach-session'}
                }).subscribe((coachSession: any) => {
                    this.coachSession = coachSession.data.length;
                    this.http.get(environment.userApi + 'user_activity', {
                        params: {...deviceInfo, type: 'tool-used'}
                    }).subscribe((toolUsed: any) => {
                        this.toolUsed = toolUsed.data.length;
                        resolve({
                            microLearning: this.microLearning,
                            coachSession: this.coachSession,
                            toolUsed: this.toolUsed
                        });
                    });
                });
            });
        });
    }

    async getSurveyScores(): Promise<any> {
        return new Promise(resolve => {
            const deviceInfo = JSON.parse(localStorage.getItem('deviceInfo'));
            this.http.get(environment.surveyApi + 'last_score', {
                params: {...deviceInfo, type: 0}
            }).subscribe((lastScore: any) => {
                this.lastScore = Number(lastScore.score);
                this.http.get(environment.surveyApi + 'compare_last_month_score', {
                    params: {...deviceInfo, type: 0}
                }).subscribe((diffLastMonthScore: any) => {
                    this.diffLastMonthScore = diffLastMonthScore.diffScore;
                    this.absDiffLastMonthScore = Math.abs(this.diffLastMonthScore);
                    this.http.get(environment.surveyApi + 'compare_first_score', {
                        params: {...deviceInfo, type: 0}
                    }).subscribe((diffFirstScore: any) => {
                        this.diffFirstScore = diffFirstScore.diffScore;
                        this.absDiffFirstScore = Math.abs(this.diffFirstScore);
                        resolve({
                            lastScore: this.lastScore,
                            diffLastMonthScore: this.diffLastMonthScore,
                            absDiffLastMonthScore: this.absDiffLastMonthScore,
                            diffFirstScore: this.diffFirstScore,
                            absDiffFirstScore: this.absDiffFirstScore
                        });
                    });
                });
            });
        });
    }

    async initChart(): Promise<any> {
        return new Promise(resolve => {
            const deviceInfo = JSON.parse(localStorage.getItem('deviceInfo'));
            this.http.get(environment.surveyApi + 'month_score_data', {
                params: {...deviceInfo, type: 0}
            }).subscribe((monthScores: any) => {
                this.chart = new Chart(this.scoreChart.nativeElement, {
                    type: 'line',
                    data: {
                        labels: this.language.getMonthNames(),
                        datasets: [
                            {
                                label: this.language.getWordByLanguage('wellbeingScore'),
                                fill: true,
                                lineTension: 0,
                                backgroundColor: 'rgba(16,217,179,.3)',
                                borderColor: 'rgb(16,217,179)',
                                borderWidth: 2,
                                pointBorderColor: 'rgba(16,217,179,1)',
                                pointBackgroundColor: '#fff',
                                pointBorderWidth: 2,
                                pointHoverRadius: 5,
                                pointHoverBackgroundColor: 'rgb(16,217,179)',
                                pointHoverBorderColor: 'rgb(16,217,179)',
                                pointHoverBorderWidth: 2,
                                pointRadius: 5,
                                pointHitRadius: 10,
                                data: monthScores.scores,
                                spanGaps: false
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        aspectRatio: 1.5,
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                });
                resolve(this.chart);
            });
        });
    }

    async onImageClicked() {
        const actionSheet = await this.actionSheetController.create({
            header: 'Choose Profile Picture',
            buttons: [
                {
                    text: 'Pick an Image',
                    icon: 'images',
                    handler: () => {
                        this.pickPicture();
                    }
                }, {
                    text: 'Take a Photo',
                    icon: 'camera',
                    handler: async () => {
                        this.takePicture();
                    }
                }, {
                    text: 'Use default',
                    icon: 'share-alt',
                    handler: async () => {
                        this.utils.showLoading().then(loading => {
                            const deviceInfo = JSON.parse(localStorage.getItem('deviceInfo'));
                            this.http.post(environment.userApi + 'update_profile_picture', {
                                deviceInfo,
                                data: '/assets/images/icon_user_avatar.png'
                            }).subscribe(() => {
                                this.profileImage = '/assets/images/icon_user_avatar.png';
                                loading.dismiss();
                            });
                        });
                    }
                }, {
                    text: 'Cancel',
                    icon: 'close',
                    role: 'cancel',
                    handler: () => {
                    }
                }
            ]
        });
        await actionSheet.present();
    }

    async takePicture() {
        await Plugins.Camera.getPhoto({
            quality: 100,
            resultType: CameraResultType.DataUrl,
            source: CameraSource.Camera
        }).then(image => {
            this.utils.showLoading().then(loading => {
                const deviceInfo = JSON.parse(localStorage.getItem('deviceInfo'));
                this.http.post(environment.userApi + 'update_profile_picture', {
                    deviceInfo,
                    data: image.dataUrl
                }).subscribe(() => {
                    this.profileImage = image.dataUrl;
                    loading.dismiss();
                });
            });
        });
    }

    async pickPicture() {
        await Plugins.Camera.getPhoto({
            quality: 100,
            resultType: CameraResultType.DataUrl,
            source: CameraSource.Photos
        }).then(image => {
            this.utils.showLoading().then(loading => {
                const deviceInfo = JSON.parse(localStorage.getItem('deviceInfo'));
                this.http.post(environment.userApi + 'update_profile_picture', {
                    deviceInfo,
                    data: image.dataUrl
                }).subscribe(() => {
                    this.profileImage = image.dataUrl;
                    loading.dismiss();
                });
            });
        });
    }

    async segmentChanged() {
        await this.slider.slideTo(this.segment);
    }

    async slideChanged() {
        this.segment = await this.slider.getActiveIndex();
    }

    toggleSideMenu() {
        this.menuOpened = !this.menuOpened;
    }

    resetPasswordClicked() {
        this.menuOpened = false;
        this.navController.navigateForward('/auth/forgot-password').then(() => {});
    }

    changeLanguageClicked() {
        this.menuOpened = false;
        this.language.setLanguage(this.language.getCurrentLanguage() === 'french' ? 'english' : 'french');
    }

    logoutUser() {
        const deviceInfo = JSON.parse(localStorage.getItem('deviceInfo'));
        this.http.post(environment.authApi + 'logout', {...deviceInfo}).subscribe(() => {
            localStorage.clear();
        });
    }

}
