import { TestBed } from '@angular/core/testing';

import { Transition } from './transition';

describe('Transition', () => {
  let service: Transition;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Transition);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
