import { Intersection } from './intersection';

export interface Delivery {
    id: number;
    pickupIntersection: Intersection;
    deliveryIntersection: Intersection;
}
