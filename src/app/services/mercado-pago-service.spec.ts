import { TestBed } from '@angular/core/testing';

import { MercadoPagoService } from './mercado-pago-service';

describe('MercadoPagoService', () => {
  let service: MercadoPagoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MercadoPagoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
