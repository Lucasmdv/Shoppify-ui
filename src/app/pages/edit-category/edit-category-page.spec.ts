import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCategoryPage } from './edit-category-page';

describe('EditCategoryPage', () => {
  let component: EditCategoryPage;
  let fixture: ComponentFixture<EditCategoryPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCategoryPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCategoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
