import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import * as L from 'leaflet';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Intersection } from '../intersection';
import { Road } from '../road';
import { Observable } from 'rxjs';
import { Map } from '../map';

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
  mapFile: File | null = null; // xml file of the map 
  allowedMapsToDisplay = ['petitPlan.json', 'moyenPlan.json', 'grandPlan.json'];
  mapOpened: boolean = false;
  mapReset: boolean = true;

  constructor(private http: HttpClient) { }

  // function that gets the xml from the front, and sends it to the backend to parse
  sendXMLtoBack() {
    this.mapFile = (document.getElementById('mapFile') as HTMLInputElement).files![0];
    // check if the file is an xml file
    if (this.mapFile && this.mapFile.type === 'text/xml') { 
      const formData = new FormData();
      formData.append('file', this.mapFile);
      this.http.post<Map>(`${this.baseLink}parse`, formData).subscribe((data) => {
        console.log("data "+ data); // TODO remove
        if(!data) {
          alert('Error while parsing the XML file');
          return;
        }
        this.loadMap(data);
      });    
    } else {
      alert('Please select an XML file');
    }
  }

  private loadMap(data : Map) {
    if(!this.mapOpened) {
      this.mapOpened = true;
      this.initMap();
    }
    if(this.mapOpened && !this.mapReset) {
      this.removeMarkers();
    }
    
    this.addIntersections(data.intersections, "circle-blue.svg"); 
    this.addRoads(data.roads);
    this.mapReset = false;
  }

  private resetMap() : void {
    this.removeMarkers();
    this.mapReset = true;
  }

  private removeMarkers(): void {
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
    L.tileLayer('https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png', {
      minZoom: 0,
      maxZoom: 20,
      attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
  }

  private addIntersections(locations : Intersection[], iconPath : string): void { 

    console.log(locations);

    var customIcon = L.icon({
      iconUrl: iconPath,
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
  }

  private addRoads(roads : Road[]): void {
    console.log(roads);

    // Add a marker to the map
    roads.forEach((road: Road) => {
      var origin: Intersection = road.origin;
      var destination: Intersection = road.destination;
      // Draw a line between the two points
      var line = L.polyline([[origin.latitude, origin.longitude], [destination.latitude, destination.longitude]], { color: 'blue' }).addTo(this.markersGroup);
    });
  }
}
