import { Component, ElementRef, QueryList, ViewChildren, ViewChild, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class Hero implements AfterViewInit {
  @ViewChildren('carouselItem') carouselItems!: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('brigVideo') brigVideo?: ElementRef<HTMLVideoElement>;

  active: number = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.playVideoIfActive();
    }
  }

  next(): void {
    const items = this.carouselItems.toArray();
    if (!items.length) return;

    items[this.active].nativeElement.classList.remove('item-active');
    items[this.active].nativeElement.classList.add('item');

    this.active = this.active >= items.length - 1 ? 0 : this.active + 1;

    items[this.active].nativeElement.classList.remove('item');
    items[this.active].nativeElement.classList.add('item-active');

    this.playVideoIfActive();
  }

  prev(): void {
    const items = this.carouselItems.toArray();
    if (!items.length) return;

    items[this.active].nativeElement.classList.remove('item-active');
    items[this.active].nativeElement.classList.add('item');

    this.active = this.active <= 0 ? items.length - 1 : this.active - 1;

    items[this.active].nativeElement.classList.remove('item');
    items[this.active].nativeElement.classList.add('item-active');

    this.playVideoIfActive();
  }

  private playVideoIfActive(): void {
    if (this.active === 0 && this.brigVideo?.nativeElement) {
      const video = this.brigVideo.nativeElement;
      video.muted = true;
      video.play().catch(() => {});
    }
  }
}