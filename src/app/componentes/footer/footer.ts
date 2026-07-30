import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FooterLink{
  name:string;
  icon: 'instagram'|'whatsapp';
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
        {name:'Whatsapp', icon: 'whatsapp', url:'https://www.instagram.com/mica.brigs/'}
      ]
    },
  ];
  buttonLinks : string[] = ['Política de Privacidade', 'Termos de uso'];
}
