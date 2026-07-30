import { NgOptimizedImage } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../cart/cart.service';
import { Transition } from '../transition/transition';
import { TransitionService } from '../../transition';
@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    NgOptimizedImage,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  @Input() transitionOverlay!: Transition;

  private cartService= inject(CartService);
    private transitionService= inject(TransitionService);


  navigate(e: Event, targetId:string):void{
    e.preventDefault();
    if(this.transitionOverlay){
      this.transitionService.scrollToSectionWithTransition(
        targetId,
        this.transitionOverlay.blockElements, 
        this.transitionOverlay.logoElements
      );
    }
  }
  openCart():void{
    this.cartService.openCart();
  }
}
