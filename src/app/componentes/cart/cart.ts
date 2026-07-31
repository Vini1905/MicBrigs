import { Component,inject,signal } from '@angular/core';
import{FormsModule} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartService } from './cart.service';
@Component({
  selector: 'app-cart',
  standalone:true,
  imports: [FormsModule, CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  public cartService = inject(CartService);

get isOpen():boolean{
  return this.cartService.isOpen();
} 

  address='';
  deliveryDate ='';
  showAddressWarning = signal(false);

  closeModal() : void{
    this.cartService.closeCart();
  }

  removeItem(index:number):void{
    this.cartService.removeItem(index);
  }

  checkout():void{
    if(this.address.trim() === ''){
      this.showAddressWarning.set(true);
      return;
    }
    if(this.cartService.cartItems().length === 0){
      alert('Seu carrinho está vazio.');
      return;
    }
   this.showAddressWarning.set(false);

   this.cartService.sendOrder(this.address, this.deliveryDate).subscribe({
    next: () => {
      const whatsappUrl = this.cartService.generateWhatsAppUrl(this.address, this.deliveryDate);
      window.open(whatsappUrl, '_blank');
      this.cartService.clearCart();
      this.closeModal();
    },
    error: (err) => {
      console.error('Erro ao registrar o pedido no servidor:', err);
      // Fallback gracioso com notificação explicita ao usuário ao invés de fail-open silencioso
      const confirmRedirect = confirm(
        'Não foi possível conectar ao servidor de pedidos. Deseja enviar o pedido diretamente via WhatsApp?'
      );
      if (confirmRedirect) {
        const whatsappUrl = this.cartService.generateWhatsAppUrl(this.address, this.deliveryDate);
        window.open(whatsappUrl, '_blank');
        this.cartService.clearCart();
        this.closeModal();
      }
    }
   });
}
}
