import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';

export const routes: Routes = [
    {
        path: 'map',
        title: 'Map Page',
        component: MapComponent,
    },
];
