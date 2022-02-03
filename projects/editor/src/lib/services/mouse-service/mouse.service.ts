import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MouseService {
    position: { x: number, y: number } = { x: 0, y: 0 };
}
