import { isPlatformBrowser, NgClass } from '@angular/common';
import {
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
  NgZone,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
  Inject,
  inject,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CartService } from '../cart/cart.service';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

gsap.registerPlugin(ScrollTrigger);

export interface Produto {
  id: number;
  nome: string;
  desc: string;
  img: string;
  categoria: 'brigadeiro' | 'brownie' | 'cesta' | 'cookie';
  selectedBox?: string;
  dropdownOpen?: boolean;
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

export interface Cookie extends Produto {
  categoria: 'cookie';
}

@Component({
  selector: 'app-store',
  standalone: true,
  imports: [NgClass],
  templateUrl: './store.html',
  styleUrl: './store.css',
})
export class Store implements AfterViewInit, OnDestroy {
  bolos: any[] = [
    {
      id: 1,
      nome: 'Bolo Trufado com Frutas Vermelhas',
      desc: 'Massa intensa de cacau com brigadeiro gourmet, morangos frescos e amoras douradas.',
      img: 'BFV.png',
      selectedBox: 'Bolo Pequeno (10 fatias)',
      dropdownOpen: false
    },
    {
      id: 2,
      nome: 'Bolo Delícia de Morango e Chocolate Branco',
      desc: 'Pão de ló leve com chantilly fresco, raspas de chocolate branco nobre e morangos.',
      img: 'BDL.png',
      selectedBox: 'Bolo Pequeno (10 fatias)',
      dropdownOpen: false
    },
    {
      id: 3,
      nome: 'Bolo Delícia de Morango e Chocolate Branco',
      desc: 'Pão de ló leve com chantilly fresco, raspas de chocolate branco nobre e morangos.',
      img: 'BDC.png',
      selectedBox: 'Bolo Pequeno (10 fatias)',
      dropdownOpen: false
    }
  ];

  isLoading: boolean = true;
  @ViewChild('canvasContainer', { static: false }) canvasContainer!: ElementRef<HTMLDivElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private model!: THREE.Object3D;
  private animationId!: number;

  private cartService = inject(CartService);
  private cdr = inject(ChangeDetectorRef);
  private animationFrameId: number | null = null;
  private ctx!: gsap.Context;

  constructor(
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  boxPrices: { [key: string]: number } = {
    'Caixa de 4 brigadeiros': 20.00,
    'Caixa de 6 brigadeiros': 38.00,
    'Caixa de 12 brigadeiros': 72.00,
    'Caixa de 24 brigadeiros': 72.00,
    'Caixa de 25 brigadeiros': 75.00,
    'Caixa de 50 brigadeiros': 140.00,
    'Caixa de 100 brigadeiros': 260.00,
    'Caixa de 4 brownies': 28.00,
    'Caixa de 6 brownies': 42.00,
    'Caixa de 12 brownies': 80.00,
    'Caixa de 25 brownies': 160.00,
    'Caixa de 50 brownies': 300.00,
    'Caixa de 100 brownies': 580.00,
    'Cesta Inteira': 120.00,
    'Cesta Especial': 18.00,
    'Pacote com 1 Cookie': 13.00,
    'Pacote com 3 Cookies': 36.00,
    'Pacote com 6 Cookies': 70.00,
    'Pacote com 12 Cookies': 130.00,
    'Pedaço Individual': 15.00,
    'Bolo Pequeno (10 fatias)': 75.00,
    'Bolo Médio (20 fatias)': 130.00,
    'Bolo Inteiro Grande': 180.00
  };

  toggleDropdown(produto: Produto, event: Event) {
    event.stopPropagation();
    this.produtos.forEach(p => {
      if (p !== produto) p.dropdownOpen = false;
    });
    produto.dropdownOpen = !produto.dropdownOpen;
  }

  selectBox(produto: Produto, boxSize: string, event?: Event) {
    if (event) event.stopPropagation();
    produto.selectedBox = boxSize;
    produto.dropdownOpen = false;
  }

  addToCart(produto: Produto) {
    let defaultBox = 'Caixa de 4 brigadeiros';
    if (produto.categoria === 'cesta') defaultBox = 'Cesta Inteira';
    if (produto.categoria === 'cookie') defaultBox = 'Pacote com 1 Cookie';
    if (produto.categoria === 'brownie') defaultBox = 'Caixa de 4 brownies';

    const boxSize = produto.selectedBox || defaultBox;
    const price = this.boxPrices[boxSize] ?? 20.00;

    this.cartService.addItem({
      id: produto.id,
      name: produto.nome,
      box_size: boxSize,
      quantity: 1,
      price_unit: price
    });
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Finaliza o loading e notifica a Change Detection do Angular
      setTimeout(() => {
        this.isLoading = false;
        this.cdr.detectChanges();

        // Inicializa animações GSAP e 3D após o DOM ser montado
        this.initAnimationsAnd3D();
      }, 300);
    }
  }

  private initAnimationsAnd3D(): void {
    this.ngZone.runOutsideAngular(() => {
      this.ctx = gsap.context(() => {
        // 1. Títulos das Seções
        gsap.utils.toArray<HTMLElement>('.app-title').forEach((title) => {
          gsap.from(title, {
            scrollTrigger: {
              trigger: title,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
            opacity: 0,
            y: 40,
            duration: 0.8,
            ease: 'power3.out',
          });
        });

        // 2. Cards de Brownie
        gsap.from('.brigs-br .card-brownie', {
          scrollTrigger: {
            trigger: '.brigs-br',
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
          opacity: 0,
          y: 45,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
        });

        // 3. Efeito do Tutorial: Elementos Flutuantes (Cookies, Brigadeiros e Gotas)
        const tlScroll = gsap.timeline({
          scrollTrigger: {
            trigger: '#app-store',
            start: 'top 85%',
            end: 'bottom bottom',
            scrub: 1.2
          }
        });

        tlScroll
          .to('.item-cookie-1', { y: 480, x: 50, rotation: 120, ease: 'none' }, 0)
          .to('.item-brigadeiro-1', { y: 650, x: -70, rotation: -160, ease: 'none' }, 0)
          .to('.item-drop-1', { y: 380, scale: 1.25, rotation: 80, ease: 'none' }, 0)
          .to('.item-drop-2', { y: 520, x: 35, rotation: -100, ease: 'none' }, 0)
          .to('.item-granulado-1', { y: 420, rotation: 190, ease: 'none' }, 0);
      });

      // Inicialização da cena 3D
      setTimeout(() => {
        if (this.canvasContainer) {
          this.init3DScene();
        }
      }, 100);
    });
  }

  private init3DScene(): void {
    try {
      if (!this.canvasContainer) return;

      const container = this.canvasContainer.nativeElement;
      const width = container.clientWidth || 320;
      const height = container.clientHeight || 320;

      // 1. CENA
      this.scene = new THREE.Scene();

      // 2. CÂMERA
      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      this.camera.position.set(0, 0, 3);

      // 3. RENDERIZADOR
      try {
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        container.innerHTML = '';
        container.appendChild(this.renderer.domElement);
      } catch (webGlError) {
        console.warn('WebGL não suportado ou bloqueado no navegador.', webGlError);
        container.innerHTML = `<img src="cookie.png" style="width:100%; height:100%; object-fit:contain;" />`;
        return;
      }

      // 4. ILUMINAÇÃO
      const ambientLight = new THREE.AmbientLight(0xffffff, 4.0);
      this.scene.add(ambientLight);

      const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2.5);
      hemiLight.position.set(0, 20, 0);
      this.scene.add(hemiLight);

      const dirLight1 = new THREE.DirectionalLight(0xffffff, 3.0);
      dirLight1.position.set(5, 5, 5);
      this.scene.add(dirLight1);

      // 5. CARREGAMENTO DE TEXTURA E MODELO
      const textureLoader = new THREE.TextureLoader();
      const texturaDoce = textureLoader.load('brigs-texture.png');
      texturaDoce.colorSpace = THREE.SRGBColorSpace;
      texturaDoce.flipY = false;

      const loader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
      dracoLoader.setWorkerLimit(0);
      loader.setDRACOLoader(dracoLoader);

      loader.load(
        'brigs.glb',
        (gltf) => {
          this.model = gltf.scene;

          this.model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.material = new THREE.MeshStandardMaterial({
                map: texturaDoce,
                roughness: 0.6,
                metalness: 0.1,
                side: THREE.DoubleSide
              });
            }
          });

          this.model.scale.set(1.4, 1.4, 1.4);
          this.model.position.set(0, -0.2, 0);
          this.scene.add(this.model);
        },
        undefined,
        (error) => console.error('Erro ao carregar o modelo no Three.js:', error)
      );

      // 6. LOOP DE RENDERIZAÇÃO
      const animate = () => {
        this.animationId = requestAnimationFrame(animate);
        if (this.model) {
          this.model.rotation.y += 0.008;
        }
        this.renderer.render(this.scene, this.camera);
      };
      animate();
    } catch (err) {
      console.error('Erro na cena 3D:', err);
    }
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.ctx) {
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
      id: 9,
      nome: 'Cookie de Chocolate',
      img: 'cookie.png',
      desc: 'Cookie artesanal macio por dentro, com pedaços generosos de chocolate nobre.',
      categoria: 'cookie',
      selectedBox: 'Pacote com 1 Cookie'
    },
    {
      id: 1,
      nome: 'Brigadeiro de Chocolate ao Leite',
      img: 'BAL.png',
      desc: 'O tradicional brigadeiro gourmet, extremamente cremoso e coberto com chocolate ao leite.',
      categoria: 'brigadeiro',
      selectedBox: 'Caixa de 4 brigadeiros'
    },
    {
      id: 2,
      nome: 'Brigadeiro Limão Siciliano',
      img: 'BL.png',
      desc: 'Chocolate branco combinado ao frescor elegante do limão siciliano.',
      categoria: 'brigadeiro',
      selectedBox: 'Caixa de 4 brigadeiros'
    },
    {
      id: 3,
      nome: 'Brigadeiro Café',
      img: 'BC.png',
      desc: 'Brigadeiro de chocolate com café, intenso e cacau black. Aromático e sofisticado.',
      categoria: 'brigadeiro',
      selectedBox: 'Caixa de 4 brigadeiros'
    },
    {
      id: 4,
      nome: 'Brigadeiro de Pistache',
      img: 'BP.png',
      desc: 'Brigadeiro preparado com o próprio pistache e granulado de sabor delicado.',
      categoria: 'brigadeiro',
      selectedBox: 'Caixa de 4 brigadeiros'
    },
    {
      id: 5,
      nome: 'Brigadeiro Caramelo Salgado',
      img: 'BCS.png',
      desc: 'O equilíbrio perfeito entre o doce do caramelo artesanal e uma delicada pitada de flor de sal.',
      categoria: 'brigadeiro',
      selectedBox: 'Caixa de 4 brigadeiros'
    },
    {
      id: 6,
      nome: 'Brigadeiro de Oreo',
      img: 'BO.png',
      desc: 'Cremoso brigadeiro branco recheado e envolvido com pedaços crocantes de biscoito Oreo.',
      categoria: 'brigadeiro',
      selectedBox: 'Caixa de 4 brigadeiros'
    },
    {
      id: 7,
      nome: 'Brigadeiro Churros',
      img: 'BCS.png',
      desc: 'Massa de doce de leite com toque suave de canela e recheio cremoso.',
      categoria: 'brigadeiro',
      selectedBox: 'Caixa de 4 brigadeiros'
    },
    {
      id: 8,
      nome: 'Brigadeiro Meio Amargo',
      img: 'BE.png',
      desc: 'Intenso e balanceado, feito com puro chocolate 54% cacau.',
      categoria: 'brigadeiro',
      selectedBox: 'Caixa de 4 brigadeiros'
    },
    {
      id: 11,
      nome: 'Brownie de Ovomaltine',
      img: 'BWC.png',
      desc: 'Massa densa e molhadinha com generosa cobertura crocante de Ovomaltine.',
      categoria: 'brownie',
      selectedBox: 'Caixa de 4 brownies'
    },
    {
      id: 12,
      nome: 'Brownie de Doce de Leite',
      img: 'BWDL.png',
      desc: 'Brownie tradicional recheado com doce de leite artesanal cremoso.',
      categoria: 'brownie',
      selectedBox: 'Caixa de 4 brownies'
    },
    {
      id: 13,
      nome: 'Cesta Degustação Completa',
      img: 'CS.png',
      desc: 'Seleção especial com brigadeiros, brownies e cookies montados para presente.',
      categoria: 'cesta',
      selectedBox: 'Cesta Inteira'
    },
    {
      id: 14,
      nome: 'Cesta Momento Doce',
      img: 'C2.png',
      desc: 'Combinação perfeita de mimos doces em caixa presenteável com laço de cetim.',
      categoria: 'cesta',
      selectedBox: 'Cesta Inteira'
    },
    {
      id: 15,
      nome: 'Cesta Especial de Brigadeiros',
      img: 'C3.png',
      desc: 'Sortimento premium com os sabores mais pedidos da confeitaria.',
      categoria: 'cesta',
      selectedBox: 'Cesta Inteira'
    }
  ];

  get brigadeiros(): Produto[] {
    return this.produtos.filter((p) => p.categoria === 'brigadeiro');
  }

  get brownies(): Produto[] {
    return this.produtos.filter((p) => p.categoria === 'brownie');
  }

  get cestas(): Produto[] {
    return this.produtos.filter((p) => p.categoria === 'cesta');
  }

  get cookies(): Produto[] {
    return this.produtos.filter((p) => p.categoria === 'cookie');
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

    this.active = this.active <= 0 ? count - 1 : this.active - 1;

    items[this.active].nativeElement.classList.remove('item');
    items[this.active].nativeElement.classList.add('item-active');
  }
}