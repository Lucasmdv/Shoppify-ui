import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationDropdown } from './notification-dropdown';

describe('NotificationDropdown', () => {
  let component: NotificationDropdown;
  let fixture: ComponentFixture<NotificationDropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationDropdown]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationDropdown);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
