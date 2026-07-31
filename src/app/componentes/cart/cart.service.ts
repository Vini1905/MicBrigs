
import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface CartItem {
  id: number;
  name: string;
  box_size: string;
  quantity: number;
  price_unit: number;
  subtotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);

  // Endpoint configurável para suportar HTTPS em produção
  private apiUrl = (typeof window !== 'undefined' && (window as any).__API_URL__)
    ? (window as any).__API_URL__
    : 'http://127.0.0.1:5000';

  isOpenSignal = signal<boolean>(false);
  itemsSignal = signal<CartItem[]>([]);

  isOpen = computed(() => this.isOpenSignal());
  cartItems = computed(() => this.itemsSignal());

  totalPrice = computed(() => {
    return this.itemsSignal().reduce((sum, item) => sum + item.subtotal, 0);
  });

  openCart() {
    this.isOpenSignal.set(true);
  }

  closeCart() {
    this.isOpenSignal.set(false);
  }

  addItem(item: Omit<CartItem, 'subtotal'>) {
    const currentItems = this.itemsSignal();
    const existingIndex = currentItems.findIndex(
      i => i.id === item.id && i.box_size === item.box_size
    );

    if (existingIndex > -1) {
      const updated = [...currentItems];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + item.quantity,
        subtotal: (updated[existingIndex].quantity + item.quantity) * updated[existingIndex].price_unit
      };
      this.itemsSignal.set(updated);
    } else {
      const newItem: CartItem = {
        ...item,
        subtotal: item.quantity * item.price_unit
      };
      this.itemsSignal.set([...currentItems, newItem]);
    }
    this.openCart();
  }

  removeItem(index: number) {
    const current = [...this.itemsSignal()];
    current.splice(index, 1);
    this.itemsSignal.set(current);
  }

  clearCart() {
    this.itemsSignal.set([]);
  }

  /**
   * Sanitização rigorosa de entradas de texto contra Injeção de Parâmetros e XSS
   */
  private sanitizeInput(input: string, maxLength = 300): string {
    if (!input) return '';
    return input
      .replace(/<[^>]*>?/gm, '') // Remove HTML tags
      .replace(/[\r\n]+/g, ' ') // Substitui quebras de linha por espaço
      .trim()
      .substring(0, maxLength);
  }

  sendOrder(address: string, deliveryDate: string) {
    const sanitizedAddress = this.sanitizeInput(address, 300);
    const sanitizedDate = this.sanitizeInput(deliveryDate, 50);

    const orderData = {
      address: sanitizedAddress,
      delivery_date: sanitizedDate || 'A combinar',
      total_price: this.totalPrice(),
      items: this.itemsSignal().map(item => ({
        name: this.sanitizeInput(item.name, 100),
        box_size: this.sanitizeInput(item.box_size, 50),
        quantity: Number(item.quantity) || 1,
        subtotal: Number(item.subtotal) || 0
      }))
    };

    return this.http.post(`${this.apiUrl}/orders`, orderData);
  }

  generateWhatsAppUrl(address: string, deliveryDate: string): string {
    const phone = '5511982524269';
    const sanitizedAddress = this.sanitizeInput(address, 300);
    const sanitizedDate = this.sanitizeInput(deliveryDate, 50);

    let msg = `*NOVO PEDIDO - MICA BRIGS*\n\n`;
    msg += `*Data desejada:* ${sanitizedDate || 'A combinar'}\n`;
    msg += `*Endereço:* ${sanitizedAddress}\n\n`;
    msg += `*ITENS DO PEDIDO:*\n`;

    this.itemsSignal().forEach(item => {
      msg += `${item.quantity}x ${item.name} (${item.box_size}) - R$ ${item.subtotal.toFixed(2).replace('.', ',')}\n`;
    });

    msg += `\n*TOTAL:* R$ ${this.totalPrice().toFixed(2).replace('.', ',')}`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  }
}