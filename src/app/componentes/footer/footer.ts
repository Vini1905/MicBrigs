import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FooterLink{
  name:string;
  icon: 'instagram'|'whatsapp'|'facebook';
  url: string;
}

interface FooterSection{
  title:string;
  links: FooterLink[];
}

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  sections: FooterSection[] =[
    {
      title:'MicaBrigs',
      links:[
        {name:'Instagram', icon: 'instagram', url:'https://www.instagram.com/mica.brigs/'}
      ]
    },
      {
      title:'Telefone',
      links:[
        {name:'Whatsapp', icon: 'whatsapp', url:'https://api.whatsapp.com/send/?phone=5511982524269&text=Oi&type=phone_number&app_absent=0&utm_source=ig'}
      ]
    },
      {
      title:'Facebook',
      links:[
        {name:'Facebook', icon: 'facebook', url:'https://api.whatsapp.com/send/?phone=5511982524269&text=Oi&type=phone_number&app_absent=0&utm_source=ig'}
      ]
    },
  ];
  buttonLinks : string[] = ['Política de Privacidade', 'Termos de uso'];
}
