import { TestBed } from '@angular/core/testing';

import { MouseService } from './mouse.service';

describe('MouseService', () => {
  let service: MouseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MouseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
