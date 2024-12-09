import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import * as L from 'leaflet';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Intersection } from '../intersection';
import { Road } from '../road';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  imports: [FormsModule, HttpClientModule, CommonModule]
})
export class MapComponent {
  private map!: L.Map;
  private baseLink = 'http://localhost:8080/api/map/'; // the link to the map API
  private markersGroup!: L.LayerGroup;
  mapName: string = ''; // Bound to the input field
  allowedMapsToDisplay = ['petitPlan.json', 'moyenPlan.json', 'grandPlan.json'];

  // variables for defer blocks
  mapOpened = false;
  mapReset = true;
  isLoading = false; // State to track loading status

  // variables used for drop down menus
  toggleLoading = false;
  toggleCourrier = false;
  toggleDelivery = false;
  toggleTours = false;

  constructor(private http: HttpClient) { }

  // API calls
  getIntersections() : Observable<Intersection[]> {
    const url = `${this.baseLink}intersections`;
    // this.http.get<Intersection>(url).subscribe(data => {
    //   console.log(data);
    // });
    return this.http.get<Intersection[]>(url);
  }
  
  // function that changes the value of the toggled zone
  toggleDropMenu(toggleZoneNumber : number) : void {
    if(toggleZoneNumber == 1) {
      this.toggleLoading = !this.toggleLoading;
    } else if(toggleZoneNumber == 2) {
      this.toggleCourrier = !this.toggleCourrier;
    } else if(toggleZoneNumber == 3) {
      this.toggleDelivery = !this.toggleDelivery;
    } else if(toggleZoneNumber == 4) {
      this.toggleTours = !this.toggleTours;
    }
  }


  getRoads() : Observable<Road[]> {
    const url = `${this.baseLink}roads`;
    // this.http.get<Road[]>(url).subscribe(data => {
    //   console.log(data);
    // });
    return this.http.get<Road[]>(url);
  }

  isTextValid(): boolean {
    return this.allowedMapsToDisplay.includes(this.mapName);
  }

  chooseMap() {
    if(!this.mapOpened) {
      this.mapOpened = true;
      this.initMap();
    }
    if(this.mapOpened && !this.mapReset) {
      this.removeMarkers();
    }
    this.isLoading = true; // Start loading

    setTimeout(() => {
      this.addIntersections();
      this.addRoads();
      this.isLoading = false; // Finish loading
    }, 2000); // Simulate loading time

    this.mapReset = false;
  }

  resetMap() : void {
    this.removeMarkers();
    this.mapReset = true;
  }

  removeMarkers(): void {
    if (this.markersGroup) {
      this.map.removeLayer(this.markersGroup); // Removes the group from the map
      this.markersGroup.clearLayers(); // Removes all markers within the group
    }
  }

  private initMap(): void {
    // Initialize the map
    this.map = L.map('mapContent', {
      center: [45.75406, 4.857418], // Lyon coordinates
      zoom: 13
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png', {
      minZoom: 0,
      maxZoom: 20,
      attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
  }

  private addIntersections(): void { 
    this.getIntersections().subscribe((mapJson: Intersection[]) => {

      var locations: Intersection[] = mapJson;
      console.log(locations);

      var customIcon = L.icon({
        iconUrl: "marker.svg",
        iconSize: [16, 16] // Adjust size as needed
      });


      // Create a LayerGroup
      this.markersGroup = L.layerGroup().addTo(this.map);

      // Add a marker to the map
      locations.forEach((location) => {
        var marker = L.marker([Number(location.latitude), Number(location.longitude)], { icon: customIcon }).addTo(this.markersGroup);
        
        marker.on('click', (event) => {
          console.log('Marker ' + location.id + ' clicked!', event);
          alert('Marker ' + location.id + ' clicked!');
        });

        // Add a popup to the marker on a mouseover event
        marker.on('mouseover', (event) => {
          marker.bindPopup('Marker ' + location.id).openPopup();
        });
      });
    });
  }

  addRoads(): void {
    this.getRoads().subscribe((mapJson: Road[]) => {

      var roads: Road[] = mapJson;
      console.log(roads);

      // Add a marker to the map
      roads.forEach((road: Road) => {
        var origin: Intersection = road.origin;
        var destination: Intersection = road.destination;
        // Draw a line between the two points
        var line = L.polyline([[Number(origin.latitude), Number(origin.longitude)], [Number(destination.latitude), Number(destination.longitude)]], { color: 'blue' }).addTo(this.markersGroup);
       
      });
    });
  }
}
