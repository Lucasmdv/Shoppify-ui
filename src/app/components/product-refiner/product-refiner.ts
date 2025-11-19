import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { Category } from '../../models/category';
import { ProductParams } from '../../models/filters/productParams';

type RefinerFormValue = {
  name: string;
  brand: string;
  discountMin: string;
  discountMax: string
  priceMin: string;
  priceMax: string;
  category: string[];
  namePriceSort: string;
  discountSort: string;
};

@Component({
  selector: 'app-products-refiner',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatOptionModule,
    MatButtonModule
  ],
  templateUrl: 'product-refiner.html',
  styleUrls: ['product-refiner.css'],
  encapsulation: ViewEncapsulation.None
})
export class ProductsRefiner implements OnInit, OnChanges{
  @Input() categories: Category[] = [];
  @Input() initialFilters: ProductParams = {};
  @Output() filterChange = new EventEmitter<ProductParams>();

  @ViewChild('refinerPanel') refiner!: ElementRef<HTMLFormElement>

  filtersForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
    this.patchFormWithFilters(this.initialFilters)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialFilters'] && this.filtersForm) {
      this.patchFormWithFilters(this.initialFilters);
    }
  }

  onFiltersSubmit(): void {
    this.filterChange.emit(this.buildFiltersFromForm());
  }

  resetFilters(): void {
    this.filtersForm.reset({
      name: '',
      brand: '',
      discountMin: '',
      discountMax: '',
      priceMin: '',
      priceMax: '',
      category: [],
      namePriceSort: '',
      discountSort: ''
    });
    this.filterChange.emit({});
  }

  get hasActiveFilters(): boolean {
    if (!this.filtersForm) return false;

    const {
      name,
      brand,
      discountMin,
      discountMax,
      priceMin,
      priceMax,
      category,
      namePriceSort,
      discountSort
    } = this.filtersForm.getRawValue() as RefinerFormValue;

    return Boolean(
      this.cleanString(name) ||
      this.cleanString(brand) ||
      this.cleanString(discountMin) ||
      this.cleanString(discountMax) ||
      this.cleanString(priceMin) ||
      this.cleanString(priceMax) ||
      (Array.isArray(category) && category.length) ||
      this.cleanString(namePriceSort) ||
      this.cleanString(discountSort)
    );
  }

  private initForm(): void {
    this.filtersForm = this.fb.group({
      name: [''],
      brand: [''],
      discountMin: ['', [Validators.pattern('^[0-9]*$')]],
      discountMax: ['', [Validators.pattern('^[0-9]*$')]],
      priceMin: ['', [Validators.pattern('^[0-9]*$')]],
      priceMax: ['', [Validators.pattern('^[0-9]*$')]],
      category: [[]],
      namePriceSort: [''],
      discountSort: ['']
    });
  }

  private buildFiltersFromForm(): ProductParams {
    const {
      name,
      brand,
      discountMin,
      discountMax,
      priceMin,
      priceMax,
      category,
      namePriceSort,
      discountSort
    } = this.filtersForm.getRawValue() as RefinerFormValue;

    const params: ProductParams = {};

    const trimmedName = this.cleanString(name);
    const trimmedBrand = this.cleanString(brand);

    if (trimmedName) params.name = trimmedName;
    if (trimmedBrand) params.brand = trimmedBrand;
    if (Array.isArray(category) && category.length) {
      params.categories = category.join(',');
    }

    const parsedPriceMin = this.toNumber(priceMin);
    const parsedPriceMax = this.toNumber(priceMax);
    if (parsedPriceMin !== null && parsedPriceMax !== null) {
      params.priceBetween = `${Math.min(parsedPriceMin, parsedPriceMax)}, ${Math.max(parsedPriceMin, parsedPriceMax)}`;
    } else if (parsedPriceMin !== null) {
      params.priceGreater = parsedPriceMin;
    } else if (parsedPriceMax !== null) {
      params.priceLess = parsedPriceMax;
    }

    const parsedDiscountMin = this.toNumber(discountMin);
    const parsedDiscountMax = this.toNumber(discountMax);
    if (parsedDiscountMin !== null && parsedDiscountMax !== null) {
      params.discountBetween = `${Math.min(parsedDiscountMin, parsedDiscountMax)}, ${Math.max(parsedDiscountMin, parsedDiscountMax)}`;
    } else if (parsedDiscountMin !== null) {
      params.discountGreater = parsedDiscountMin;
    } else if (parsedDiscountMax !== null) {
      params.discountLess = parsedDiscountMax;
    }

    const trimmedNamePriceSort = this.cleanString(namePriceSort);
    const trimmedDiscountSort = this.cleanString(discountSort)

    if (trimmedNamePriceSort) {
      const sortMap: Record<string, string> = {
        nameAsc: 'name,asc',
        nameDesc: 'name,desc',
        priceAsc: 'price,asc',
        priceDesc: 'price,desc'
      };

      const mappedSort = sortMap[trimmedNamePriceSort];
      if (mappedSort) {
        params.sort = mappedSort;
      }
    } else if (trimmedDiscountSort) {
      params.sort = `discountPercentage,${trimmedDiscountSort}`
    }

    return params;
  }

  private patchFormWithFilters(filters: ProductParams): void {
    const patchValue: RefinerFormValue = {
      name: filters.name ?? '',
      brand: filters.brand ?? '',
      priceMin: '',
      priceMax: '',
      discountMin: '',
      discountMax: '',
      category: filters.categories ? filters.categories.split(',') : [],
      namePriceSort: '',
      discountSort: '',
    };

    if (filters.priceBetween) {
      const [min, max] = filters.priceBetween.split(',').map(v => v.trim());
      patchValue.priceMin = min ?? '';
      patchValue.priceMax = max ?? '';
    } else {
      if (filters.priceGreater !== undefined) patchValue.priceMin = `${filters.priceGreater ?? ''}`;
      if (filters.priceLess !== undefined) patchValue.priceMax = `${filters.priceLess ?? ''}`;
    }

    if (filters.discountBetween) {
      const [min, max] = filters.discountBetween.split(',').map(v => v.trim());
      patchValue.discountMin = min ?? '';
      patchValue.discountMax = max ?? '';
    } else {
      if (filters.discountGreater !== undefined) patchValue.discountMin = `${filters.discountGreater ?? ''}`;
      if (filters.discountLess !== undefined) patchValue.discountMax = `${filters.discountLess ?? ''}`;
    }

    if (filters.sort) {
      const [field, direction] = filters.sort.split(',');
      if (field === 'name') {
        patchValue.namePriceSort = direction === 'desc' ? 'nameDesc' : 'nameAsc';
      } else if (field === 'price') {
        patchValue.namePriceSort = direction === 'desc' ? 'priceDesc' : 'priceAsc';
      } else if (field === 'discountPercentage') {
        patchValue.discountSort = direction ?? '';
      }
    }

    this.filtersForm.patchValue(patchValue, { emitEvent: false });
  }

  private cleanString(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  private toNumber(value: unknown): number | null {
    if (value === undefined || value === null || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private scroll(event: WheelEvent) {
  const element = this.refiner.nativeElement as HTMLElement;
  
  if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) {
    return; 
  }

  const isScrollingDown = event.deltaY > 0;
  const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 1;
  const isAtTop = element.scrollTop <= 1;
  if ((isScrollingDown && isAtBottom) || (!isScrollingDown && isAtTop)) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  const speed = 40;
  element.scrollTop += event.deltaY > 0 ? speed : -speed;
}
}
