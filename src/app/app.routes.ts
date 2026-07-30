import { Routes } from '@angular/router';
import { Home } from './componentes/home/home';
import { Hero } from './componentes/hero/hero';
import { Aboutus } from './componentes/aboutus/aboutus';

export const routes: Routes = [
     {
        path:'aboutus',
        component:Aboutus
    },
    {
        path:"",
        component:Home
    },
    {
        path:"home",
        component:Home
    },
    {
        path:"hero",
        component:Hero
    },
    {
        path:'', redirectTo: '/menu', pathMatch:'full'
    }
];
