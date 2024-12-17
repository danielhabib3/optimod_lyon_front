import { DeliveryRequest } from './deliveryRequest';
import { Map } from './map';

export interface Tour {
    id: number;
    route: Map;
    deliveryRequest: DeliveryRequest;
}