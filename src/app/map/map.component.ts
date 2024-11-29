import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import * as L from 'leaflet';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Intersection } from '../intersection';
import { Road } from '../road';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  imports: [FormsModule, HttpClientModule]
})
export class MapComponent {
  private map!: L.Map;
  private baseLink = 'http://localhost:8080/api/map/'; // the link to the map API
  private markersGroup!: L.LayerGroup;
  mapName: string = ''; // Bound to the input field
  allowedMapsToDisplay = ['petitPlan.json', 'moyenPlan.json', 'grandPlan.json'];

  constructor(private http: HttpClient) { }

  // API calls
  getIntersections() {
    const url = `${this.baseLink}intersections`;
    this.http.get<Intersection>(url).subscribe(data => {
      console.log(data);
    });
  }

  getRoads() {
    const url = `${this.baseLink}roads`;
    this.http.get<Road>(url).subscribe(data => {
      console.log(data);
    });
  }

  isTextValid(): boolean {
    return this.allowedMapsToDisplay.includes(this.mapName);
  }

  mapOpened = false;
  chooseMap() {
    if(!this.mapOpened) {
      this.mapOpened = true;
      this.initMap();
    }
    if(this.mapOpened && !this.mapReset) {
      this.removeMarkers();
    }
    
    this.addIntersections();
    this.mapReset = false;
  }

  mapReset: boolean = true;

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
    this.map = L.map('map', {
      center: [45.75406, 4.857418], // Lyon coordinates
      zoom: 13
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);
  }

  private addIntersections(): void { 
    // Assuming the JSON file is located at 'data.json'
    fetch('mapJson/' + this.mapName)
    .then(response => response.json())  // Parse the response as JSON
    .then(mapJson => {
      console.log(mapJson.reseau.noeud);  // Use the JSON data here

      var locations = mapJson.reseau.noeud;
      console.log(locations);

      var customIcon = L.icon({
        iconUrl: "marker.svg",
        iconSize: [16, 16] // Adjust size as needed
      });

      interface Location {
        "-latitude": string;
        "-longitude": string;
        "-id": string;
      }

      // Create a LayerGroup
      this.markersGroup = L.layerGroup().addTo(this.map);

      // Add a marker to the map
      locations.forEach((location: Location) => {
        var marker = L.marker([Number(location["-latitude"]), Number(location["-longitude"])], { icon: customIcon }).addTo(this.markersGroup);
        // Capture click event on the marker
        marker.on('click', (event) => {
          console.log('Marker ' + location["-id"] + ' clicked!', event);
          alert('Marker ' + location["-id"] + ' clicked!');
        });

        // Add a popup to the marker on a mouseover event
        marker.on('mouseover', (event) => {
          marker.bindPopup('Marker ' + location["-id"]).openPopup();
        });
      });
    })
    .catch(error => console.error('Error loading JSON:', error));

    // // Draw a line between the two points
    // var line = L.polyline([[45.75184, 4.87654], [45.759773, 4.8756394]], { color: 'blue' }).addTo(this.map);
    
    // // Optionally, zoom to fit the line
    // this.map.fitBounds(line.getBounds());
  }
}
