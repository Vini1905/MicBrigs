import { Component, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Header } from "../header/header";
import { Hero } from '../hero/hero';
import { Store } from '../store/store';
import { Aboutus } from "../aboutus/aboutus";
import { Cart } from '../cart/cart';
import { Footer } from '../footer/footer';
import { AfterViewInit, effect, OnDestroy } from '@angular/core';
import {gsap} from 'gsap';
import{ScrollSmoother, ScrollTrigger} from 'gsap/all';
import { Transition } from "../transition/transition";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

@Component({
  selector: 'app-home',
  standalone:true,
  imports: [Header, Hero, Store, Aboutus, Cart, Footer, Transition],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements AfterViewInit, OnDestroy{
  private smoother! : ScrollSmoother;
  private ctx!: gsap.Context;

  constructor(
    private ngZone : NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ){}

  ngAfterViewInit() {
    if(isPlatformBrowser(this.platformId)){
    this.ngZone.runOutsideAngular(() =>{
    this.ctx = gsap.context(() => {
      this.smoother = ScrollSmoother.create({
        wrapper:'#smooth-wrapper',
        content: '#smooth-content',
        smooth:0.7,
        effects:true,
        smoothTouch:false,
      });
    });
   setTimeout(() =>{
  ScrollTrigger.refresh();
},250);    
  });
}
  }

  ngOnDestroy(): void {
    if(this.ctx){
      this.ctx.revert();
    }
    }
  }
