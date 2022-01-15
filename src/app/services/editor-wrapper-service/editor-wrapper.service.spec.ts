import { TestBed } from '@angular/core/testing';

import { EditorWrapperService } from './editor-wrapper.service';

describe('WrapperService', () => {
  let service: EditorWrapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditorWrapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
