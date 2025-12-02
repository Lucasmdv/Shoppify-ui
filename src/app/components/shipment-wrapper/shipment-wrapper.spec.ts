import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentWrapper } from './shipment-wrapper';

describe('ShipmentWrapper', () => {
  let component: ShipmentWrapper;
  let fixture: ComponentFixture<ShipmentWrapper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShipmentWrapper]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipmentWrapper);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
