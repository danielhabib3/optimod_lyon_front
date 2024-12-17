import { Component } from '@angular/core';
import { MapComponent } from './map/map.component';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  imports: [MapComponent, HeaderComponent], 
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'Optimod\'Lyon';
}
