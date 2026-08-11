import { isPlatformBrowser, NgClass } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChildren, NgZone, AfterViewInit, OnDestroy, PLATFORM_ID, Inject, inject, ViewChild } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/all';
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
  categoria: 'brigadeiro' | 'brownie' | 'cesta' |'cookie';
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
  isLoading: boolean = true;
  @ViewChild('canvasContainer', { static: false }) canvasContainer!: ElementRef<HTMLDivElement>;
  
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private model!: THREE.Object3D;
  private animationId!: number;

  private cartService = inject(CartService);
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
    'Cesta Inteira': 120.00,
    'Cesta Especial': 18.00,
    'Pacote com 1 Cookie' : 13.00,
    'Pacote com 3 CookieS' : 13.00,
    'Pacote com 6 CookieS' : 13.00,
    'Pacote com 12 CookieS' : 13.00,


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
    const boxSize = produto.selectedBox || (produto.categoria === 'cesta' ? 'Cesta Especial' : 'Caixa de 4 brigadeiros');
    const price = this.boxPrices[boxSize] || 20.00;
    this.cartService.addItem({
      id: produto.id,
      name: produto.nome,
      box_size: boxSize,
      quantity: 1,
      price_unit: price
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() =>{
      this.isLoading = false;
    },800);
    if (isPlatformBrowser(this.platformId)) {
      
      this.ngZone.runOutsideAngular(() => {
        // Inicializa o contexto principal do GSAP
        this.ctx = gsap.context(() => {

          gsap.utils.toArray<HTMLElement>('.app-title').forEach((title) => {
            gsap.from(title, {
              scrollTrigger: {
                trigger: title,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
              opacity: 0,
              y: 50,
              duration: 1,
              stagger: 0.15,
              ease: 'power3.out',
            });
          });

          gsap.from('.brigs-br .card-brownie', {
            scrollTrigger: {
              trigger: '.brigs-br',
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
            opacity: 0,
            y: 50,
            duration: 1,
            stagger: 0.15,
            ease: 'power3.out',
          });

        });

        // Delay para subir a cena 3D após o DOM estar totalmente pronto
        setTimeout(() => {
          if (this.canvasContainer) {
            this.init3DScene();
          }
        }, 100);
      });
    }
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

      // 3. RENDERIZADOR
      this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;

      container.innerHTML = '';
      container.appendChild(this.renderer.domElement);

      // 4. ILUMINAÇÃO (Brilho intenso para eliminar sombra preta)
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

      const caminhoModelo = 'brigs.glb';

      loader.load(
        caminhoModelo, 
        (gltf) => {
          this.model = gltf.scene;

          // Aplica textura e habilita reflexo básico
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

          // Estado Inicial: Gigante e centralizado
          this.model.scale.set(1.4, 1.4, 1.4);
          this.model.position.set(0, -0.2, 0);
          this.scene.add(this.model);
        },
        undefined,
        (error) => console.error('Erro ao carregar o modelo no Three.js:', error)
      );

      

      // 7. LOOP DE RENDERIZAÇÃO
      const animate = () => {
        this.animationId = requestAnimationFrame(animate);
    if (this.model) {
      this.model.rotation.y +=0.008;
    }
    this.renderer.render(this.scene, this.camera);
  };
  animate();
}catch(err){
  console.error('Erro na cena 3D:', err);
}
  }
  ngOnDestroy(): void{
        if(this.animationId){
          cancelAnimationFrame(this.animationId);
        }
        if(this.renderer){
          this.renderer.dispose();
        }
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
      id: 9,
      nome: 'Cookie de Chocolate',
      img: '',
      desc: 'O tradicional brigadeiro gourmet, extremamente cremoso e coberto com chocolate ao leite.',
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
      desc: 'Brigadeiro preparado com o próprio pistache, e granulado de pistache de sabor delicado e acabamento refinado. Um dos sabores mais especiais da casa.',
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
      selectedBox: 'Cesta Inteira'
    },
    {
      id: 9,
      nome: 'Cesta',
      img: 'C2.png',
      desc: 'O equilíbrio perfeito entre o doce do caramelo artesanal e uma delicada pitada de flor de sal.',
      categoria: 'cesta',
      selectedBox: 'Cesta Inteira'
    },
    {
      id: 10,
      nome: 'Cesta',
      img: 'C3.png',
      desc: 'O equilíbrio perfeito entre o doce do caramelo artesanal e uma delicada pitada de flor de sal.',
      categoria: 'cesta',
      selectedBox: 'Cesta Inteira'
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

    get cookies(): Produto[] {
    return this.produtos.filter((produto) => produto.categoria === 'cookie');
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