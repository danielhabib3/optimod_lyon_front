import { Intersection } from './intersection';
export interface Road {
    length : number;
    origin : Intersection;
    destination : Intersection;
    name : string;
}
