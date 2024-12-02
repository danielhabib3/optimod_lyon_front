import { Road } from './road';
import { Intersection } from './intersection';

export interface Map {
    id : number;
    roads : Road[];
    intersections : Intersection[];
}
