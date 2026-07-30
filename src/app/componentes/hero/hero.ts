import { NgOptimizedImage } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';

@Component({
  standalone:true,
  selector: 'app-hero',
  imports: [NgOptimizedImage],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
@ViewChildren('carouselItem') carouselItems!:QueryList<ElementRef<HTMLElement>>;

active: number = 0;

next(): void{
  const items = this.carouselItems.toArray();
  const count = items.length;
   if(count === 0) return;
    
  items[this.active].nativeElement.classList.remove('item-active');
  items[this.active].nativeElement.classList.add('item');

  this.active = this.active >= count - 1 ? 0 : this.active +1
  
  items[this.active].nativeElement.classList.remove('item');
  items[this.active].nativeElement.classList.add('item-active');

   }

   prev(): void{
  const items = this.carouselItems.toArray();
  const count = items.length;
   if(count === 0) return;
    
  items[this.active].nativeElement.classList.remove('item-active');
  items[this.active].nativeElement.classList.add('item');

  this.active = this.active >= count - 1 ? 0 : this.active +1
  
  items[this.active].nativeElement.classList.remove('item');
  items[this.active].nativeElement.classList.add('item-active');

   }
  }