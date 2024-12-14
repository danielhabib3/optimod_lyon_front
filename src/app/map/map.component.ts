import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import * as L from 'leaflet';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Intersection } from '../intersection';
import { Road } from '../road';
import { Observable } from 'rxjs';
import { Courier } from '../courier'; // Import Courier interface
import { Map } from '../map';
import { CommonModule } from '@angular/common';
import { Delivery } from '../delivery';
import { Tour } from '../tour';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  imports: [FormsModule, HttpClientModule, CommonModule]
})
export class MapComponent {
  private map!: L.Map;
  private baseLink = 'http://localhost:8080/api/'; // the link to the map API
  private markersGroup!: L.LayerGroup;
  xmlFile: File | null = null; // xml file of the map 
  allowedMapsToDisplay = ['petitPlan.json', 'moyenPlan.json', 'grandPlan.json'];
  mapOpened: boolean = false;
  restoreTours: boolean = false;
  mapReset: boolean = true;
  allCouriers: Courier[] = [];
  selectedCouriers: Courier[] = [];
  numberOfCouriers: number = 1;
  pickupIntersection: Intersection | null = null;
  deliveryIntersection: Intersection | null = null;
  deliveriesToAdd: Delivery[] = [];
  // a list of 20 colors to use for roads
  colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'brown', 'pink', 'black', 'white', 'gray', 'cyan', 'magenta', 'olive', 'lime', 'teal', 'navy', 'maroon', 'silver', 'gold'];


  isLoading = false; // State to track loading status

  // variables used for drop down menus
  toggleLoading = false;
  toggleCourrier = false;
  toggleDelivery = false;
  toggleTours = false;

  constructor(private http: HttpClient) { }

  // function that gets the xml from the front, and sends it to the backend to parse
  // typeToSend is delivery or map
  sendXMLtoBack(typeToSend: string) {
    this.xmlFile = (document.getElementById(`${typeToSend}File`) as HTMLInputElement).files![0];
    // check if the file is an xml file
    if (this.xmlFile && this.xmlFile.type === 'text/xml') { 
      const formData = new FormData();
      formData.append('file', this.xmlFile);

    
      switch(typeToSend) {
        case 'map':

        this.http.post<Map>(`${this.baseLink}${typeToSend}/parse`, formData).subscribe((data) => {
          console.log("data "+ data);
          if(!data) {
            alert('Error while parsing the XML file');
            return;
          }
          if (data.intersections.length === 0 && data.roads.length === 0) {
            alert('No data found in the XML file or the XML file is not well formatted as a map, no roads or intersections found');
            return;
          }
          this.loadMap(data);
        });



          
          break;
        case 'deliveryRequest':

          if (this.selectedCouriers.length === 0) {
            alert('Please select at least one courier');
            return;
          }

          formData.append('couriers', JSON.stringify(this.selectedCouriers));
          console.log(JSON.stringify(this.selectedCouriers));
          console.log(JSON.stringify(this.deliveriesToAdd));
          formData.append('deliveriesAdded', JSON.stringify(this.deliveriesToAdd));
          this.http.post<Tour[]>(`${this.baseLink}${typeToSend}/parseAndGetBestRoutePerCourier`, formData).subscribe((data) => {
            console.log("data "+ data);
            if(!data) {
              alert('Error while parsing the XML file');
              return;
            }
            this.loadDelivery(data);
          });

          // this.http.get<>(`${this.baseLink}${typeToSend}/getDeliveryRequest`).subscribe((data) => {
          //   console.log("data "+ data);
          //   if(!data) {
          //     alert('Error while getting the delivery request');
          //     return;
          //   }

          // });

          
          break;
        default:
          alert('Error while parsing the XML file');
          break;
      }
    
    } else {
      alert('Please select an XML file');
    }
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


  private loadMap(data : Map) {
    if(this.mapOpened && !this.mapReset) {
      this.removeMarkers();
    }
    
    this.addIntersections(data.intersections, "circle-blue.svg", [12, 12], true, ""); 
    this.addRoads(data.roads, 'blue');
    this.mapReset = false;
  }


  // NOT FINSIHED, DEPENDING ON THE RESPONSE OF THE BACKEND
  private loadDelivery(data : Tour[]) {
    if(this.mapOpened && !this.mapReset) {
      this.removeMarkers();
    }

    let colorCounter = 0;
    data.forEach((tour) => {

      const pickupIntersections: Intersection[] = tour.deliveryRequest.deliveries.map(delivery => delivery.origin);
      const deliveryIntersections: Intersection[] = tour.deliveryRequest.deliveries.map(delivery => delivery.destination);
      const warehouseIntersection: Intersection = tour.deliveryRequest.warehouse.address;
      this.addIntersections([warehouseIntersection], "warehouse.svg", [18, 18], false, "");
      this.addIntersections(pickupIntersections, "pickup.svg", [18, 18], false, "");
      this.addIntersections(deliveryIntersections, "delivery.svg", [18, 18], false, "");
      
      const otherIntersections: Intersection[] = tour.route.intersections;
      this.addIntersections(otherIntersections, "", [12, 12], false, this.colors[colorCounter]); 
      this.addRoads(tour.route.roads, this.colors[colorCounter]);
      colorCounter++;
    
    });
    this.mapReset = false;
    
    
  }



  loadCouriers() {
    this.http.get<Courier[]>(`${this.baseLink}couriers`).subscribe((couriers) => {
      console.log(couriers);
      if (couriers.length === 0) {
      alert('No couriers found');
      return;
      }
      this.allCouriers = couriers;
      this.allCouriers.forEach(courier => {
      console.log(`Courier ID: ${courier.id}, Name: ${courier.name}`);
      });
    }, error => {
      console.error('Error loading couriers', error);
      alert('Error loading couriers');
    });
  }

  addCourier() {
    if (this.selectedCouriers.length == this.numberOfCouriers) {
      alert(`You can only add up to ${this.numberOfCouriers} couriers.`);
      return;
    }

    const courierNames = document.getElementById('courierNames') as HTMLSelectElement;
    const selectedCourierId = parseInt(courierNames.value, 10);
    let selectedCourier: Courier | undefined = this.allCouriers.find(courier => courier.id === selectedCourierId);
    if (!selectedCourier) {
      alert('Please select a valid courier');
      return;
    }
    if (this.selectedCouriers.some(courier => courier.id === selectedCourierId)) {
      alert('Courier is already added');
      return;
    }
    this.selectedCouriers.push(selectedCourier);
  }

  confirmCourierCount() {
    const courierCountInput = document.getElementById('courierCount') as HTMLInputElement;
    const count2 = parseInt(courierCountInput.value, 10);

    if (isNaN(count2) || count2 < 1 || count2 > this.allCouriers.length) {
      alert(`Please enter a valid number of couriers between 1 and ${this.allCouriers.length}.`);
      return;
    }
    
    this.selectedCouriers = [];

    this.numberOfCouriers = count2;
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

    if(this.mapOpened) {
      return;
    }

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
    this.mapOpened = true;
  }

  private addIntersections(locations : Intersection[], iconPath : string, iconSize: [number, number] = [6, 6], ifMap: boolean, color: string): void { 
  
      console.log(locations);

      let markerIsPhoto = true;
      if (iconPath === "") {
        markerIsPhoto = false;
      }
      
      if(markerIsPhoto) {
        var customIcon = L.icon({
          iconUrl: iconPath,
          iconSize: iconSize // Adjust size as needed
        });
     }


    // If markersGroup already exists and contains markers, add them to the new LayerGroup
    if (!(this.markersGroup && this.markersGroup.getLayers().length > 0)) {
      this.markersGroup = L.layerGroup().addTo(this.map);
    }

    // Add a marker to the map
    locations.forEach((location) => {
      let marker: L.Marker<any> | L.Circle<any>;
      if(markerIsPhoto) {
        marker = L.marker([Number(location.latitude), Number(location.longitude)], { icon: customIcon }).addTo(this.markersGroup);
      }
      else {
        marker = L.circle([Number(location.latitude), Number(location.longitude)], {
          color: color,          // Circle border color
          fillColor: color,     // Circle fill color
          fillOpacity: 0.5,      // Circle fill opacity
          radius: 10          // Radius in meters
        }).addTo(this.markersGroup);
      }


      if (ifMap) {     
        marker.on('click', (event) => {
          console.log('Marker ' + location.id + ' clicked!', event);
          if (this.pickupIntersection === null) {
            this.pickupIntersection = location;

            const pickupLocationInput = document.getElementById('pickupLocation') as HTMLInputElement;
            if (pickupLocationInput) {
              pickupLocationInput.value = `${location.latitude}, ${location.longitude}`;
            }

          } else if (this.deliveryIntersection === null) {
            this.deliveryIntersection = location;

            const deliveryLocationInput = document.getElementById('deliveryLocation') as HTMLInputElement;
            if (deliveryLocationInput) {
              deliveryLocationInput.value = `${location.latitude}, ${location.longitude}`;
            }

          } else {
            alert('Both pickup and delivery intersections are already selected');
            return;
          }
        });
      }

      // Add a popup to the marker on a mouseover event
      marker.on('mouseover', (event) => {
        marker.bindPopup('Marker ' + location.id).openPopup();
      });
    });
  }

  clearSelection() {
    this.pickupIntersection = null;
    this.deliveryIntersection = null;
    const pickupLocationInput = document.getElementById('pickupLocation') as HTMLInputElement;
    if (pickupLocationInput) {
      pickupLocationInput.value = 'Pick address';
    }
    const deliveryLocationInput = document.getElementById('deliveryLocation') as HTMLInputElement;
    if (deliveryLocationInput) {
      deliveryLocationInput.value = 'Pick address';
    }
  }

  addDelivery() {
    if (this.pickupIntersection === null || this.deliveryIntersection === null) {
      alert('Please select both pickup and delivery intersections');
      return;
    }

    this.deliveriesToAdd.push({
      origin: this.pickupIntersection,
      destination: this.deliveryIntersection
    });

    console.log(this.deliveriesToAdd);
    this.clearSelection();
  }

  clearDeliveries() {
    this.deliveriesToAdd = [];
  }

  private addRoads(roads : Road[], colorRoad: string): void {
    console.log(roads);

    // Add a marker to the map
    roads.forEach((road: Road) => {
      var origin: Intersection = road.origin;
      var destination: Intersection = road.destination;
      // Draw a line between the two points
      var line = L.polyline([[origin.latitude, origin.longitude], [destination.latitude, destination.longitude]], { color: colorRoad }).addTo(this.markersGroup);
    });
  }


  ngOnInit() {
    this.loadCouriers();
    this.initMap();
  }
}
