import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  isOpen = signal(false);

  openCart(){
    this.isOpen.set(true);
  }
  closeCart(){
    this.isOpen.set(false);
  }
}
