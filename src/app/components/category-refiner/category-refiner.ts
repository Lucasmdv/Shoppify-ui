import { Component, input, OnInit, output, SimpleChanges } from '@angular/core';
import { Category } from '../../models/category';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CategoryParams } from '../../models/filters/category-params';

type RefinerFormValue = {
  name: string;
  nameSort: string;
};

@Component({
  selector: 'app-category-refiner',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './category-refiner.html',
  styleUrl: './category-refiner.css'
})
export class CategoryRefiner implements OnInit{
  categories = input<Category[]>([])
  initialFilters = input<CategoryParams>({});
  filterChange = output<CategoryParams>();

  filtersForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.patchFormWithFilters(this.initialFilters());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialFilters'] && this.filtersForm) {
      this.patchFormWithFilters(this.initialFilters());
    }
  }

  onFiltersSubmit(): void {
    this.filterChange.emit(this.buildFiltersFromForm())
  }

  resetFilters(): void {
    this.filtersForm.reset({
      name: '',
      nameSort: '',
    });
    this.filterChange.emit({});
  }

  get hasActiveFilters(): boolean {
    if (!this.filtersForm) return false;

    const {
      name,
      nameSort,
    } = this.filtersForm.getRawValue() as RefinerFormValue;

    return Boolean(
      this.cleanString(name) ||
      this.cleanString(nameSort)
    )
  }

  private initForm(): void {
    this.filtersForm = this.fb.group({
      name: [''],
      nameSort: [''],
    })
  }

  private buildFiltersFromForm(): CategoryParams {
    const {
      name,
      nameSort,
    } = this.filtersForm.getRawValue() as RefinerFormValue;

    const params: CategoryParams = {};
    const trimmedName = this.cleanString(name);
    const trimmedNameSort = this.cleanString(nameSort);
    if (trimmedName) params.name = trimmedName;
    if (trimmedNameSort) {
      params.sort = `name,${trimmedNameSort}`;
    }
    return params;
  }

  private patchFormWithFilters(filters: CategoryParams): void {
    const patchValue: RefinerFormValue = {
      name: filters.name ?? '',
      nameSort: '',
    }

    if (filters.sort) {
      const [field, direction] = filters.sort.split(',');
      if (field === 'name') {
        patchValue.nameSort = direction ?? '';
    }
    this.filtersForm.patchValue(patchValue, { emitEvent: false });
  }
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
}