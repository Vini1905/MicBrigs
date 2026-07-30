import { Injectable, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

@Injectable({
  providedIn: 'root'
})
export class TransitionService {
  private isAnimating = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
  ) {
    if (isPlatformBrowser(this.platformId)) {
      // Registra a curva apenas no navegador
      gsap.registerPlugin(CustomEase);
      CustomEase.create('hop', 'M0,0 C0.05,0 0.133,0.16 0.166,0.208 0.206,0.265 0.9,1 1,1');
    }
  }

  public scrollToSectionWithTransition(targetId: string, blocks: HTMLElement[], logoSvg: HTMLElement): void {
    // Garante que NADA disso tente rodar no servidor (SSR)
    if (!isPlatformBrowser(this.platformId) || this.isAnimating) return;

    this.isAnimating = true;

    this.ngZone.runOutsideAngular(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          this.isAnimating = false;
        }
      });

      // 1. Barras cobrem a tela
      gsap.set(blocks, { scaleX: 0, transformOrigin: 'left center' });
      gsap.set(logoSvg, { opacity: 0, y: 30, scale: 0.9 });

      tl.to(blocks, {
        scaleX: 1,
        duration: 0.6,
        ease: 'hop',
        stagger: 0.08
      })
      .to(logoSvg, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: 'power3.out'
      }, '-=0.3')

      // 2. FASE DE SCROLL
      .add(() => {
        const targetElement = document.querySelector(targetId) as HTMLElement;

        if (targetElement) {
          // Busca a instância ativa do ScrollSmoother sem precisar de import top-level
          const smoother = (gsap as any).plugins?.ScrollSmoother?.get?.() || 
                           (window as any).ScrollSmoother?.get?.();

          if (smoother) {
            smoother.scrollTo(targetElement, false, 'top top');
          } else {
            // FALLBACK DIRETO DO NAVEGADOR (100% Funcional caso o smoother não responda)
            const topPosition = targetElement.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top: topPosition, behavior: 'instant' });
          }
        }
      }, '+=0.1')

      // 3. Barras abrem a tela
      .to(logoSvg, {
        opacity: 0,
        y: -30,
        duration: 0.3,
        ease: 'power3.in'
      })
      .add(() => {
        gsap.set(blocks, { transformOrigin: 'right center' });
      })
      .to(blocks, {
        scaleX: 0,
        duration: 0.6,
        ease: 'hop',
        stagger: 0.08
      }, '-=0.1');
    });
  }
}