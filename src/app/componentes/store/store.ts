
import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren, NgZone, AfterViewInit, OnDestroy, PLATFORM_ID, Inject, inject } from '@angular/core';
import {gsap} from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import { CartService } from '../cart/cart.service';

gsap.registerPlugin(ScrollTrigger);

export interface Produto {
  id: number;
  nome: string;
  desc: string;
  img: string;
  categoria: 'brigadeiro' | 'brownie' | 'cesta';
  selectedBox?:string;
  dropdownOpen?:boolean;
}

export interface Brigadeiro extends Produto {
  categoria: 'brigadeiro';
}

export interface Brownie extends Produto {
  categoria: 'brownie';
}

export interface Cesta extends Produto {
  categoria: 'cesta';
}

export interface Sabor {
  id: string;
  nome: string;
  imagem: string;
  Classesabor: string;
}


@Component({
  selector: 'app-store',
  imports: [NgClass],
  templateUrl: './store.html',
  styleUrl: './store.css',
})
export class Store implements AfterViewInit,OnDestroy {
  private cartService = inject(CartService);
  private animationFrameId: number | null = null;
  private ctx!: gsap.Context;

  toggleDropdown(produto: Produto, event:Event){{
    event.stopPropagation();

    this.produtos.forEach(p=>{
      if(p !== produto) p.dropdownOpen = false;
    });
    produto.dropdownOpen = !produto.dropdownOpen;
  }}
  selectedBox(produto: Produto, boxSize:string, event:Event){
    event.stopPropagation();
    produto.selectedBox = boxSize;
    produto.dropdownOpen= false;
  }
  

  constructor(private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId:Object
  ) {}

  boxPrices:{[key:string]: number} ={
    'Caixa de 4 brigadeiros': 20.00,
    'Caixa de 6 brigadeiros': 38.00,
    'Caixa de 12 brigadeiros': 72.00,
    'Caixa de 24 brigadeiros': 72.00,
    'Cesta Inteira': 120.00,
    'Cesta Especial': 18.00,
  };

  selectBox(produto:Produto, boxSize:string){
    produto.selectedBox = boxSize;
  }

  addToCart(produto:Produto){
    const boxSize = produto.selectedBox || (produto.categoria === 'cesta' ? 'Cesta Especial' : 'Caixa de 4 brigadeiros');
    const price = this.boxPrices[boxSize]|| 20.00;
    this.cartService.addItem({
      id:produto.id,
      name: produto.nome,
      box_size: boxSize,
      quantity:1,
      price_unit: price
    })
  }
  
  ngAfterViewInit(): void {
    if(isPlatformBrowser(this.platformId)){
      this.ngZone.runOutsideAngular(()=>{
        setTimeout(() =>{
        this.ctx = gsap.context(() =>{

          gsap.utils.toArray<HTMLElement>('.app-title').forEach((title) =>{
            gsap.from(title, {
              scrollTrigger:{
                trigger:title,
                start:'top 85%',
                toggleActions: 'play none none reverse',
              },
              opacity:0,
              y:50,
              duration:1,
              stagger:0.15,
              ease:'power3.out',
            });
          });

          gsap.from('.brigs-br .card-brownie', {
           scrollTrigger:{
                trigger:'.brigs-br',
                start:'top 80%',
                toggleActions: 'play none none reverse',
              },
              opacity:0,
              y:50,
              duration:1,
              stagger:0.15,
              ease:'power3.out',
              
            });
          });
          ScrollTrigger.refresh();
          },100);
        });
    }
  }

  ngOnDestroy(): void {
    if(this.ctx){
      this.ctx.revert();
    }
  }

  onCardMouseMove(e: MouseEvent, cardElement: HTMLElement) {
    this.ngZone.runOutsideAngular(() => {
      const light = cardElement.querySelector('.card-light') as HTMLElement | null;
      if (!light) return;

      const posicaoCard = cardElement.getBoundingClientRect();
      const mouseX = e.clientX - posicaoCard.left;
      const mouseY = e.clientY - posicaoCard.top;

      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }

      this.animationFrameId = requestAnimationFrame(() => {
        light.style.opacity = '1';
        light.style.transform = `translate3d(${mouseX - 100}px, ${mouseY - 100}px, 0)`;
      });
    });
  }

  onCardMouseLeave(cardElement: HTMLElement) {
    this.ngZone.runOutsideAngular(() => {
      const light = cardElement.querySelector('.card-light') as HTMLElement | null;
      if (light) {
        light.style.opacity = '0';
      }
    });
  }

  produtos: Produto[] = [
    {
      id: 1,
      nome: 'Brigadeiro de Chocolate ao Leite',
      img: 'BAL.png',
      desc: 'O tradicional brigadeiro gourmet, extremamente cremoso e coberto com chocolate ao leite.',
      categoria: 'brigadeiro',
      selectedBox:'Caixa de 4 brigadeiros'
    },
    {
      id: 2,
      nome: 'Brigadeiro Limão Siciliano',
      img: 'BL.png',
      desc: 'Chocolate branco combinado ao frescor elegante do limão siciliano.',
      categoria: 'brigadeiro',
      selectedBox:'Caixa de 4 brigadeiros'

    },
    {
      id: 3,
      nome: 'Brigadeiro Café',
      img: 'BC.png',
      desc: 'Brigadeiro de chocolate com café, intenso e cacau black. Aromático e sofisticado.',
      categoria: 'brigadeiro',
      selectedBox:'Caixa de 4 brigadeiros'

    },
    {
      id: 4,
      nome: 'Brigadeiro de Pistache',
      img: 'BP.png',
      desc: 'Brigadeiro preparado com o próprio pistache ,  e granulado de pistache de sabor delicado e acabamento refinado. Um dos sabores mais especiais da casa.',
      categoria: 'brigadeiro',
      selectedBox:'Caixa de 4 brigadeiros'

    },
    {
      id: 5,
      nome: 'Brigadeiro Caramelo Salgado',
      img: 'BCS.png',
      desc: 'O equilíbrio perfeito entre o doce do caramelo artesanal e uma delicada pitada de flor de sal.',
      categoria: 'brigadeiro',
      selectedBox:'Caixa de 4 brigadeiros'

    },
    {
      id: 6,
      nome: 'Brownie de Ovomaltine',
      img: 'BWC.png',
      desc: 'O equilíbrio perfeito entre o doce do caramelo artesanal e uma delicada pitada de flor de sal.',
      categoria: 'brownie',
    },
    {
      id: 7,
      nome: 'Brownie de Doce de Leite',
      img: 'BWDL.png',
      desc: 'O equilíbrio perfeito entre o doce do caramelo artesanal e uma delicada pitada de flor de sal.',
      categoria: 'brownie',
    },
    {
      id: 8,
      nome: 'Cesta Inteira',
      img: 'CS.png',
      desc: 'O equilíbrio perfeito entre o doce do caramelo artesanal e uma delicada pitada de flor de sal.',
      categoria: 'cesta',
      selectedBox:'Cesta Inteira'
    },
     {
      id: 9,
      nome: 'Cesta',
      img: 'C2.png',
      desc: 'O equilíbrio perfeito entre o doce do caramelo artesanal e uma delicada pitada de flor de sal.',
      categoria: 'cesta',
      selectedBox:'Cesta Inteira'
    },
     {
      id: 10,
      nome: 'Cesta',
      img: 'C3.png',
      desc: 'O equilíbrio perfeito entre o doce do caramelo artesanal e uma delicada pitada de flor de sal.',
      categoria: 'cesta',
      selectedBox:'Cesta Inteira'
    },
  ];

  sabor: Sabor[] = [
    {
      id: 'preto',
      nome: 'Clássico',
      imagem: '',
      Classesabor: '',
    },
  ];

  get brigadeiros(): Produto[] {
    return this.produtos.filter((produto) => produto.categoria === 'brigadeiro');
  }

  get brownies(): Produto[] {
    return this.produtos.filter((produto) => produto.categoria === 'brownie');
  }

  get cestas(): Produto[] {
    return this.produtos.filter((produto) => produto.categoria === 'cesta');
  }

  @ViewChildren('carouselItem') carouselItems!: QueryList<ElementRef<HTMLElement>>;

  active: number = 0;

  next(): void {
    const items = this.carouselItems.toArray();
    const count = items.length;
    if (count === 0) return;

    items[this.active].nativeElement.classList.remove('item-active');
    items[this.active].nativeElement.classList.add('item');

    this.active = this.active >= count - 1 ? 0 : this.active + 1;

    items[this.active].nativeElement.classList.remove('item');
    items[this.active].nativeElement.classList.add('item-active');
  }

  prev(): void {
    const items = this.carouselItems.toArray();
    const count = items.length;
    if (count === 0) return;

    items[this.active].nativeElement.classList.remove('item-active');
    items[this.active].nativeElement.classList.add('item');

    // Corrigido para decrementar ao clicar no botão "anterior"
    this.active = this.active <= 0 ? count - 1 : this.active - 1;

    items[this.active].nativeElement.classList.remove('item');
    items[this.active].nativeElement.classList.add('item-active');
  }
}
