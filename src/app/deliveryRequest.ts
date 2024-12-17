import { Courier } from './courier';
import { Delivery } from './delivery';
import { Warehouse } from './warehouse';

export interface DeliveryRequest {
    id : number;
    warehouse: Warehouse;
    deliveries: Delivery[];
    courier: Courier;
}
