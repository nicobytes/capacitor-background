import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { interval, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Media, MEDIA_STATUS } from '@ionic-native/media/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  durations = [
    {
      audio: 'assets/audios/estrellita_donde_estas.mp3',
      duration: 2400,
    },
    {
      audio: 'assets/audios/toda_la_noche.mp3',
      duration: 30,
    },
    {
      audio: 'assets/audios/contando_ovejitas.mp3',
      duration: 30,
    },
  ];
  current = 0;
  isAndroid: boolean;
  duration = 0;

  constructor(
    private media: Media,
    private platform: Platform,
    private backgroundMode: BackgroundMode
  ) {
    this.isAndroid = this.platform.is('android');
  }

  async start() {
    this.backgroundMode.enable();
    this.current = 0;
    this.duration = 0;
    await this.startTimeout();
  }

  async startTimeout() {
    console.log('startTimeout');
    const item = this.durations[this.current];
    this.current++;
    const file = await this.play(this.getPath(item.audio));
    this.createTimeout(item.duration)
      .subscribe(
        () => {
          this.duration++;
          console.log(this.duration);
        },
        error => console.log(error),
        async () => {
          console.log('stop');
          file.stop();
          if (this.current <= this.durations.length - 1) {
            this.startTimeout();
          }
        }
      );
  }

  createTimeout(seconds: number) {
    const timer$ = timer((seconds + 1) * 1000);
    return interval(1000)
      .pipe(
        takeUntil(timer$),
      );
  }

  async play(url: string) {
    const file = this.media.create(url);
    file.play({ playAudioWhenScreenIsLocked: true, numberOfLoops: 9999 });
    file.onStatusUpdate.subscribe(event => {
      console.log(event);
      if (this.isAndroid && MEDIA_STATUS.STOPPED === event) {
        file.seekTo(0);
        file.play({ playAudioWhenScreenIsLocked: true, numberOfLoops: 9999 });
      }
    });
    return file;
  }

  private getPath(path: string) {
    if (this.isAndroid) {
      return `/android_asset/www/${path}`;
    }
    return path;
  }

}
