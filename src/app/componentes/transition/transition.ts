import { Component, ElementRef, ViewChild, ViewChildren,QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-transition',
  imports: [CommonModule],
  template: `
  <div class="transition-grid">
  <div #block class="transition-block"></div>
   <div #block class="transition-block"></div>
  <div #block class="transition-block"></div>
  <div #block class="transition-block"></div>
  </div>

  <div class="transition-logo-wrapper">
    <div #logoSvg class="logo-box">
      <img src="Logo.svg" width="500" height="500"/>
      <svg viewBox="0 0 200 60" class="micbrigs-svg">
      </svg>
    </div>
    <div>

  `,
  styles:[`
    .transition-grid{
      position: fixed;
      top:0;
      left:0;
      width: 100vw;
      height:100vh;
      display:flex;
      flex-direction: column;
      pointer-events:none;
      z-index:15;
    }
    .transition-block{
      flex:1;
      background-color: #322114;
      transform:scaleX(0);
      will-change:transform;
    }
    .transition-logo-wrapper{
      position: fixed;
      top:0;
      left:0;
      width: 100vw;
      height:100vh;
      display:flex;
      flex-direction: column;
      align-items: center;
      pointer-events:none;
      z-index:15;
    }
    .logo-box{
      opacity: 0;
      will-change: transform, opacity;
    }

    .mic-brigs-svg{
      width:280px;
      height:auto;
    }
    `]
})
export class Transition {
  @ViewChildren('block') blocks!: QueryList<ElementRef<HTMLElement>>;
    @ViewChild('logoSvg') logoSvg!: ElementRef<HTMLElement>;

    get blockElements():HTMLElement[]{
      return this.blocks.map(b => b.nativeElement);
    }

     get logoElements():HTMLElement{
      return this.logoSvg.nativeElement;
    }

}
