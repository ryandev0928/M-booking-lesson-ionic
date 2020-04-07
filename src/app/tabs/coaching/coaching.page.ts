import {Component} from '@angular/core';
import {Events, LoadingController, ModalController, NavController} from '@ionic/angular';
import {LanguageService} from '../../../services/language/language.service';
import {UserInterfaceService} from '../../../services/user-interface/user-interface.service';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Calendar, CalendarDay, CanvasRect, CoachingReview, CoachingSession, Rect, Time} from '../../../interface/interface';
import {UtilsService} from '../../../services/utils/utils.service';
import {CallModalPage} from '../../modals/call-modal/call-modal.page';

class DotPosition {
    radius: number;
    angle: number;
    margin: number;

    constructor(radius, angle, margin) {
        this.radius = radius;
        this.angle = angle;
        this.margin = margin;
    }

    getPosition() {
        // tslint:disable-next-line:radix
        const posX = parseInt(String(this.radius + (Math.cos(this.angle) * (this.radius - this.margin))));
        // tslint:disable-next-line:radix
        const posY = parseInt(String(this.radius - (Math.sin(this.angle) * (this.radius - this.margin))));
        return {posX, posY};
    }
}

class DrawCanvasClockAP {
    posX: number;
    posY: number;

    constructor(context, radius, flag) {
        context.font = '15px arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = '#10D9B3';
        this.posX = radius;
        this.posY = radius + 20;
        context.fillText(flag === 0 ? 'AM' : 'PM', this.posX, this.posY);
    }

    position() {
        return {position: {posX: this.posX, posY: this.posY}, size: {width: 20, height: 18}};
    }
}

class DrawCanvasClockHour {
    posX: number;
    posY: number;

    constructor(context, radius, num) {
        context.font = '15px arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = '#10D9B3';
        const position = new DotPosition(radius, Math.PI / 2 - num * Math.PI / 6, 50).getPosition();
        this.posX = position.posX;
        this.posY = position.posY;
        context.fillText(num.toString(), this.posX, this.posY);
    }

    position() {
        return {position: {posX: this.posX, posY: this.posY}, size: {width: 15, height: 15}};
    }
}

class DrawCanvasClockMinute {
    posX: number;
    posY: number;
    num: number;

    constructor(context, radius, num) {
        this.num = num;
        context.font = '18px arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = '#10D9B3';
        const position = new DotPosition(radius, Math.PI / 2 - num * Math.PI / 30, 15).getPosition();
        this.posX = position.posX;
        this.posY = position.posY;
        context.fillText((num % 5 === 0 ? (num % 60).toString() : ''), this.posX, this.posY);
    }

    position() {
        return {
            position: {posX: this.posX, posY: this.posY},
            size: {width: (this.num % 5 === 0 ? 20 : 0), height: (this.num % 5 === 0 ? 20 : 0)}
        };
    }
}

class DrawCanvasClockHand {
    constructor(context, radius, position, width) {
        context.beginPath();
        context.lineWidth = width;
        context.lineCap = 'round';
        context.moveTo(radius, radius);
        context.lineTo(position.posX, position.posY);
        context.strokeStyle = '#10D9B3';
        context.stroke();
    }
}

@Component({
    selector: 'app-coaching',
    templateUrl: './coaching.page.html',
    styleUrls: ['./coaching.page.scss'],
})
export class CoachingPage {

    timelineData: any[];
    sessionScheduleOpened: boolean;
    sessionGuideOpened: boolean;

    slidesOpts = {
        slidesPerView: 1,
        coverflowEffect: {
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
        },
        on: {
            beforeInit() {
                const swiper = this;

                swiper.classNames.push(`${swiper.params.containerModifierClass}coverflow`);
                swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);

                swiper.params.watchSlidesProgress = true;
                swiper.originalParams.watchSlidesProgress = true;
            },
            setTranslate() {
                const swiper = this;
                const {
                    width: swiperWidth, height: swiperHeight, slides, $wrapperEl, slidesSizesGrid, $
                } = swiper;
                const params = swiper.params.coverflowEffect;
                const isHorizontal = swiper.isHorizontal();
                const transform$$1 = swiper.translate;
                const center = isHorizontal ? -transform$$1 + (swiperWidth / 2) : -transform$$1 + (swiperHeight / 2);
                const rotate = isHorizontal ? params.rotate : -params.rotate;
                const translate = params.depth;
                // Each slide offset from center
                for (let i = 0, length = slides.length; i < length; i += 1) {
                    const $slideEl = slides.eq(i);
                    const slideSize = slidesSizesGrid[i];
                    const slideOffset = $slideEl[0].swiperSlideOffset;
                    const offsetMultiplier = ((center - slideOffset - (slideSize / 2)) / slideSize) * params.modifier;

                    let rotateY = isHorizontal ? rotate * offsetMultiplier : 0;
                    let rotateX = isHorizontal ? 0 : rotate * offsetMultiplier;
                    // var rotateZ = 0
                    let translateZ = -translate * Math.abs(offsetMultiplier);

                    let translateY = isHorizontal ? 0 : params.stretch * (offsetMultiplier);
                    let translateX = isHorizontal ? params.stretch * (offsetMultiplier) : 0;

                    // Fix for ultra small values
                    if (Math.abs(translateX) < 0.001) {
                        translateX = 0;
                    }
                    if (Math.abs(translateY) < 0.001) {
                        translateY = 0;
                    }
                    if (Math.abs(translateZ) < 0.001) {
                        translateZ = 0;
                    }
                    if (Math.abs(rotateY) < 0.001) {
                        rotateY = 0;
                    }
                    if (Math.abs(rotateX) < 0.001) {
                        rotateX = 0;
                    }

                    // tslint:disable-next-line:max-line-length
                    const slideTransform = `translate3d(${translateX}px,${translateY}px,${translateZ}px)  rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

                    $slideEl.transform(slideTransform);
                    $slideEl[0].style.zIndex = -Math.abs(Math.round(offsetMultiplier)) + 1;
                    if (params.slideShadows) {
                        // Set shadows
                        // tslint:disable-next-line:max-line-length
                        let $shadowBeforeEl = isHorizontal ? $slideEl.find('.swiper-slide-shadow-left') : $slideEl.find('.swiper-slide-shadow-top');
                        // tslint:disable-next-line:max-line-length
                        let $shadowAfterEl = isHorizontal ? $slideEl.find('.swiper-slide-shadow-right') : $slideEl.find('.swiper-slide-shadow-bottom');
                        if ($shadowBeforeEl.length === 0) {
                            $shadowBeforeEl = swiper.$(`<div class="swiper-slide-shadow-${isHorizontal ? 'left' : 'top'}"></div>`);
                            $slideEl.append($shadowBeforeEl);
                        }
                        if ($shadowAfterEl.length === 0) {
                            $shadowAfterEl = swiper.$(`<div class="swiper-slide-shadow-${isHorizontal ? 'right' : 'bottom'}"></div>`);
                            $slideEl.append($shadowAfterEl);
                        }
                        if ($shadowBeforeEl.length) {
                            $shadowBeforeEl[0].style.opacity = offsetMultiplier > 0 ? offsetMultiplier : 0;
                        }
                        if ($shadowAfterEl.length) {
                            $shadowAfterEl[0].style.opacity = (-offsetMultiplier) > 0 ? -offsetMultiplier : 0;
                        }
                    }
                }

                // Set correct perspective for IE10
                if (swiper.support.pointerEvents || swiper.support.prefixedPointerEvents) {
                    const ws = $wrapperEl[0].style;
                    ws.perspectiveOrigin = `${center}px 50%`;
                }
            },
            setTransition(duration) {
                const swiper = this;
                swiper.slides
                    .transition(duration)
                    .find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left')
                    .transition(duration);
            }
        }
    };

    sessions: CoachingSession[];
    reviews: CoachingReview[] = [
        {
            user_name: 'OminumPro user',
            user_photo: '/assets/images/icon_user_avatar.png',
            review_content: 'It helped me so much deal with my anxiety issues, today my anxiety is gone!',
            review_rating: 5
        },
        {
            user_name: 'OminumPro user',
            user_photo: '/assets/images/icon_user_avatar.png',
            review_content: 'I was given a therapist who is exactly what I needed. Respectful, qualified, and genuine. She is committed to my therapy as much as I am',
            review_rating: 5
        },
        {
            user_name: 'OminumPro user',
            user_photo: '/assets/images/icon_user_avatar.png',
            review_content: 'Great smoker for a long time, I wanted to get rid of this addiction. I knew I needed help getting rid of "my best friend" so I booked a session.<br>' +
                'I believed and miracle, it worked! No sleep or mood disorders, the joy of seeing the hours without cigarettes, a sweet euphoria. Stop telling yourself that this is impossible...',
            review_rating: 5
        }
    ];

    calendarShow: boolean;

    currentDate: string;
    calendar: Calendar;
    selectedDay: CalendarDay;

    clockShow: boolean;
    canvasRect: CanvasRect;
    canvasWidth: number;
    canvasHeight: number;
    canvasContext: any;
    canvasRadius: any;

    hourNumbers: Rect[];
    minuteNumbers: Rect[];
    apFlag: Rect;

    selectedTime?: Time;

    constructor(
        private http: HttpClient,
        private events: Events,
        private navController: NavController,
        private modalController: ModalController,
        private language: LanguageService,
        private ui: UserInterfaceService,
        private utils: UtilsService
    ) {
    }

    ionViewWillEnter() {
        this.ui.pageContainerScrollToTop(document.getElementsByClassName('page-container')[0] as HTMLDivElement);
        this.timelineData = [
            this.language.getWordByLanguage('howWorkStepDescription1'),
            this.language.getWordByLanguage('howWorkStepDescription2'),
            this.language.getWordByLanguage('howWorkStepDescription3'),
            this.language.getWordByLanguage('howWorkStepDescription4'),
        ];
        this.sessionScheduleOpened = true;
        this.sessionGuideOpened = true;

        this.calendarShow = false;

        this.currentDate = '';
        this.calendar = null;
        this.selectedDay = null;

        this.clockShow = false;
        const canvas = document.getElementById('clock-face') as HTMLCanvasElement;

        canvas.addEventListener('click', (event) => {
            if (this.hourNumbers.length > 0 && this.minuteNumbers.length > 0) {
                const matchedHour = this.hourNumbers.filter(
                    x => Math.abs(x.position.posX - event.offsetX) <= x.size.width / 2
                        && Math.abs(x.position.posY - event.offsetY) <= x.size.height / 2);
                if (matchedHour.length > 0) {
                    this.selectedTime.hour = this.hourNumbers.indexOf(matchedHour[0]) + 1;
                    this.drawClock(this.selectedTime);
                } else {
                    const matchedMinute = this.minuteNumbers.filter(
                        x => Math.abs(x.position.posX - event.offsetX) <= x.size.width / 2
                            && Math.abs(x.position.posY - event.offsetY) <= x.size.height / 2);
                    if (matchedMinute.length > 0) {
                        if ((this.minuteNumbers.indexOf(matchedMinute[0]) + 1) % 5 === 0) {
                            this.selectedTime.minute = (this.minuteNumbers.indexOf(matchedMinute[0]) + 1);
                            this.drawClock(this.selectedTime);
                        }
                    } else {
                        if (Math.abs(this.apFlag.position.posX - event.offsetX) <= this.apFlag.size.width / 2
                            && Math.abs(this.apFlag.position.posY - event.offsetY) <= this.apFlag.size.height / 2) {
                            this.selectedTime.flag = 1 - this.selectedTime.flag;
                            this.drawClock(this.selectedTime);
                        }
                    }
                }
            }
        });

        this.canvasRect = canvas.getBoundingClientRect() as CanvasRect;
        this.canvasWidth = canvas.width;
        this.canvasHeight = canvas.height;
        this.canvasContext = canvas.getContext('2d');
        this.canvasRadius = canvas.height / 2;

        const now = new Date();
        this.selectedTime = {
            hour: now.getHours(),
            minute: now.getMinutes(),
            // tslint:disable-next-line:radix
            flag: parseInt(String(now.getHours() / 12))
        };
        this.getUpcomingSessions();
        // this.getRecentReviews();
        this.getCalendarDates();
    }

    checkScroll(e) {
        if (this.ui.watchPageControllerScrolled(e.target)) {
            this.events.publish('page-not-scrolled');
        } else {
            this.events.publish('page-scrolled');
        }
    }

    toggleSessionScheduleOpened() {
        this.sessionScheduleOpened = !this.sessionScheduleOpened;
    }

    toggleSessionGuideOpened() {
        this.sessionGuideOpened = !this.sessionGuideOpened;
    }

    toggleCalendarShow() {
        this.calendarShow = !this.calendarShow;
        if (!this.calendarShow) {
            setTimeout(() => {
                this.calendar = null;
                this.selectedDay = null;
                this.currentDate = '';
                this.clockShow = false;
                this.selectedTime = null;
                this.events.publish('page-not-scrolled');
            }, 500);
        } else {
            const now = new Date();
            this.selectedTime = {
                hour: (now.getHours() <= 12 ? now.getHours() : now.getHours() - 12),
                minute: now.getMinutes(),
                // tslint:disable-next-line:radix
                flag: parseInt(String(now.getHours() / 12))
            };
            this.getCalendarDates();
            this.events.publish('page-scrolled');
        }
    }

    toggleClockShow() {
        this.clockShow = !this.clockShow;
        if (this.clockShow) {
            this.drawClock(this.selectedTime);
        }
    }

    getUpcomingSessions() {
        this.utils.showLoading().then(loading => {
            const deviceInfo = JSON.parse(localStorage.getItem('deviceInfo'));
            this.http.get(environment.coachingApi + 'sessions', {
                params: { ...deviceInfo }
            }).subscribe((response: any) => {
                this.sessions = response.data;
                loading.dismiss();
            });
        });
    }

    // getRecentReviews() {
    //     this.utils.showLoading().then(loading => {
    //         this.http.get(environment.coachingApi + 'coach_reviews').subscribe((response: any) => {
    //             this.reviews = response.data as CoachingReview[];
    //             loading.dismiss();
    //         });
    //     });
    // }

    requestCoachingSession() {
        this.utils.showConfirm('Your coach will call you via Zoom call. In the meantime, if you need to cancel or reschedule your appointment, please know that all cancellations and reschedules are completed within OminumPro App. For both cancellations and reschedules, we require a minimum of 24 hours notice', '', 
        () => {
            this.utils.showLoading().then(loading => {
                const deviceInfo = JSON.parse(localStorage.getItem('deviceInfo'));
                const sessionDate = this.calendar.year + '-' + this.calendar.month + '-' + this.selectedDay.day + ' ' +
                    (this.selectedTime.flag > 0 ? 12 + this.selectedTime.hour : this.selectedTime.hour) + ':' +
                    (this.selectedTime.minute === 60 ? '00' : this.selectedTime.minute) + ':00';
                this.http.post(environment.coachingApi + 'set_session', {
                    deviceInfo,
                    date: sessionDate
                }).subscribe((response: any) => {
                    loading.dismiss().then(() => {
                        this.toggleCalendarShow();
                        localStorage.setItem('requested-coaching', response.session);
                        // this.events.publish('navigate-forward-url', 'prepare-coaching');
                        this.events.publish('navigate-forward-url', 'coaching-question');
                    });
                }); 
            });
        }).then(() => {});
    }

    cancelCoachingSession(session: CoachingSession) {
        this.utils.showConfirmCancel('Are you sure you want to cancel the coach session you selected?', '', () => {
            this.http.post(environment.coachingApi + 'cancel_session', {
                session_id: session.id
            }).subscribe(() => {
                this.getUpcomingSessions();
            });
        });
    }

    callToCoach(session: CoachingSession) {
        if (session.coach_user) {
            this.modalController.create({
                component: CallModalPage,
                componentProps: {
                    user: {
                        id: session.coach_user,
                        name: session.coach_user_name,
                        photo: session.coach_user_photo ? session.coach_user_photo : '/assets/images/icon_user_avatar.png',
                        phone: session.coach_user_phone
                    },
                    type: 'voice',
                    direction: 'outbound'
                }
            }).then(modal => {
                modal.onDidDismiss().then(async (callback) => {
                    if (callback.data.duration > 0) {
                        localStorage.setItem('review-session', String(session.id));
                        await this.navController.navigateForward('coaching-review-question');
                    }
                });
                modal.present();
            });
        } else {
            this.utils.showAlert('No coaching user has been matched to this session', '').then(() => {});
        }
    }

    getCalendarDates(direction?: string) {
        this.utils.showLoading({
            message: 'Loading Calendar...'
        }).then(loading => {
            this.sendCalendarRequest(direction).then(async (calendar: Calendar) => {
                this.calendar = calendar;
                this.selectedDay = this.calendar.today as CalendarDay;
                this.currentDate = this.calendar.year + '-' + this.calendar.month + '-' + this.calendar.today.day;
                await loading.dismiss();
            });
        });
    }

    selectDay(weekIndex: number, dayIndex: number) {
        const prevSelected = this.calendar.days[this.selectedDay.week][this.selectedDay.weekday] as CalendarDay;
        const curSelected = this.calendar.days[weekIndex][dayIndex] as CalendarDay;
        if (curSelected.upcoming || !curSelected.enable) {
            this.utils.showToast('You cannot select this day').then(() => {
            });
        } else {
            prevSelected.selected = 0;
            curSelected.selected = 1;
            this.selectedDay = curSelected;
        }
    }

    drawClock(time?: Time) {
        this.hourNumbers = [];
        this.minuteNumbers = [];
        this.canvasContext.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        for (let h = 1; h < 13; h++) {
            const hourNum = new DrawCanvasClockHour(this.canvasContext, this.canvasRadius, h);
            this.hourNumbers.push(hourNum.position());
        }

        for (let m = 1; m < 61; m++) {
            const minuteNum = new DrawCanvasClockMinute(this.canvasContext, this.canvasRadius, m);
            this.minuteNumbers.push(minuteNum.position());
        }

        const apFlag = new DrawCanvasClockAP(this.canvasContext, this.canvasRadius, this.selectedTime.flag);
        this.apFlag = apFlag.position();

        const hourHand = new DrawCanvasClockHand(this.canvasContext, this.canvasRadius, this.hourNumbers[time.hour - 1].position, 4);
        // tslint:disable-next-line:max-line-length
        const minuteHand = new DrawCanvasClockHand(this.canvasContext, this.canvasRadius, this.minuteNumbers[time.minute - 1].position, 2);
    }

    async sendCalendarRequest(direction: string): Promise<Calendar> {
        return new Promise(resolve => {
            const deviceInfo = JSON.parse(localStorage.getItem('deviceInfo'));
            const params = {...deviceInfo};
            if (this.currentDate !== '') {
                params.date = this.currentDate;
            }
            if (direction) {
                params.direction = direction;
            }
            this.http.get(environment.coachingApi + 'calendar', {
                params
            }).subscribe(async (calendar: any) => {
                resolve(calendar.calendar);
            });
        });
    }

    milliseconds(date?: string) {
        return new Date(date).getTime();
    }

}
