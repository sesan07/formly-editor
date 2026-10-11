import { Injectable, signal } from '@angular/core';

@Injectable()
export class MouseInsideService {
  protected readonly isMoudeInsideSrc = signal(false);
  readonly isMouseInside = this.isMoudeInsideSrc.asReadonly();

  setMouseInside(isInside: boolean) {
    this.isMoudeInsideSrc.set(isInside);
  }
}
