import { TestBed } from '@angular/core/testing';

import { FieldDroplistService } from './field-droplist.service';

describe('FieldDroplistService', () => {
  let service: FieldDroplistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FieldDroplistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
