import { Component } from '@angular/core';
import { MapComponent } from './map/map.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [MapComponent, HeaderComponent, FooterComponent], 
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'Optimod\'Lyon';
}
