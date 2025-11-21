import { TestBed } from '@angular/core/testing';

import { CartSignal } from './cart-signal';

describe('CartSignal', () => {
  let service: CartSignal;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartSignal);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
