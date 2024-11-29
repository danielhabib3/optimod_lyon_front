import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  imports: [FormsModule]
})
export class MapComponent {
  private map!: L.Map;
  private markersGroup!: L.LayerGroup;
  mapName: string = ''; // Bound to the input field
  allowedMapsToDisplay = ['petitPlan.json', 'moyenPlan.json', 'grandPlan.json'];

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
    this.addRoads();
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
  }

  addRoads(): void {
    fetch('mapJson/' + this.mapName)
    .then(response => response.json())  // Parse the response as JSON
    .then(mapJson => {
      console.log(mapJson.reseau.noeud);  // Use the JSON data here

      var locations = mapJson.reseau.noeud;
      var roads = mapJson.reseau.troncon;
      console.log(roads);


      interface Location {
        "-latitude": string;
        "-longitude": string;
        "-id": string;
      }

      interface Road {
        "-destination": string;
        "-nomRue": string;
        "-origine": string;
        "-longueur": string;
      }


      // Add a marker to the map
      roads.forEach((road: Road) => {
        var origin: Location | null = null;
        var destination: Location | null = null;
        locations.forEach((location: Location) => {
          if (location["-id"] == road["-origine"]) {
            origin = location;
          }
          if (location["-id"] == road["-destination"]) {
            destination = location;
          }
        });
        // Draw a line between the two points
        if (origin && destination) {
          var line = L.polyline([[Number(origin["-latitude"]), Number(origin["-longitude"])], [Number(destination["-latitude"]), Number(destination["-longitude"])]], { color: 'blue' }).addTo(this.markersGroup);
        } else {
          console.error('Origin or destination not found for road:', road);
        }
      });
    })
    .catch(error => console.error('Error loading JSON:', error));
  }
}
