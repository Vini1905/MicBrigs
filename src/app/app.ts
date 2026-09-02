import { Component, signal } from '@angular/core';
import { Home } from "./componentes/home/home";

@Component({
  selector: 'app-root',
  imports: [Home],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('micbrigs-1.0');
}
