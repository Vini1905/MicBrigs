
import { computed,inject,Injectable,signal } from '@angular/core';

import { HttpClient } from '@angular/common/http';


  

export interface CartItem{

  id:number;

  name:string;

  box_size:string;

  quantity:number;

  price_unit:number;

  subtotal:number;

}

  

@Injectable({

  providedIn:'root'

})

  

export class CartService {

  private http = inject(HttpClient);

  private apiUrl= 'http://127.0.0.1:5000';

  

  isOpenSignal = signal<boolean>(false);

  itemsSignal = signal<CartItem[]>([]);

  

  isOpen = computed (() => this.isOpenSignal());

  cartItems = computed(() => this.itemsSignal());

  

  totalPrice = computed(() =>{

    return this.itemsSignal().reduce((sum,item)=> sum + item.subtotal, 0);

  });

  

  openCart(){

    this.isOpenSignal.set(true);

  }

  

  closeCart(){

    this.isOpenSignal.set(false);

  }

  

  addItem(item: Omit<CartItem, 'subtotal'>){

    const currentItems= this.itemsSignal();

    const existingIndex = currentItems. findIndex(

      i=> i.id === item.id && i.box_size === item.box_size

    );

  

    if(existingIndex > -1){

      const updated = [...currentItems];

      updated[existingIndex].quantity * updated [existingIndex].price_unit;

      this.itemsSignal.set(updated);

    }else{

      const newItem : CartItem ={

        ...item,

        subtotal: item.quantity * item.price_unit

      };

      this.itemsSignal.set([...currentItems, newItem])

    }

    this.openCart

  }

  

  removeItem(index:number){

    const current = [...this.itemsSignal()];

    current.splice(index,1);

    this.itemsSignal.set(current);

  }

  

  clearCart(){

    this.itemsSignal.set([]);

  }

  

  sendOrder(address: string, deliveryDate: string){

    const orderData = {

      address:address,

      delivery_date: deliveryDate || 'A combinar',

      total_price: this.totalPrice(),

      items:this.itemsSignal().map(item =>({

        name:item.name,

        box_size: item.box_size,

        quantity: item.quantity,

        subtotal: item.subtotal

      }))

    };

  

    return this.http.post(`${this.apiUrl}/orders`, orderData);

  }

  

  generateWhatsAppUrl(address:string, deliveryDate: string): string{

    const phone = '5511982524269';

  

    let msg = `*NOVO PEDIDO - MICA BRIGS* \n \n`;

    msg += `*Data desejada:*${deliveryDate||'A combinar'}\n`;

    msg += `*Endereço:*${address}\n\n`;

    msg += `*ITENS DO PEDIDO:*\n`;

  

    this.itemsSignal().forEach(item =>{

    msg += `${item.quantity}x ${item.name} (${item.box_size} - R$ ${ item.subtotal.toFixed(2).replace('.',',') }\n`;

  });

  msg += `\n*TOTAL:* R$ ${this.totalPrice().toFixed(2).replace('.',',')}`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`; 

  }

  }