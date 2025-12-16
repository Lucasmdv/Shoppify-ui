import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CarouselService } from '../../services/carousel-service';
import { Carouselitem } from '../../models/carouselitem';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';



@Component({
  selector: 'app-notification',
  imports: [CommonModule, ReactiveFormsModule, MatDatepickerModule, MatInputModule, MatFormFieldModule],
  templateUrl: './notification.html',
  styleUrl: './notification.css'
})
export class Notification implements OnInit {

  carouselItems: Carouselitem[] = [];
  selectedItem? : Carouselitem
  fg!: FormGroup;
  minDate: Date = new Date();

  constructor(
    private carouselService: CarouselService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.renderItems()
    this.initForm()
  }

  renderItems(){
    this.carouselService.getCarousel().subscribe({
      next:(data) => {
        this.carouselItems = data
        const id = this.route.snapshot.params['id']

        if(id){
        this.selectedItem = data.find(a => a.id == id)
        }
      },
    })
  }


  resetCurrent(){
    if(this.selectedItem){
      this.fg.patchValue(this.selectedItem)
    }
    else{
      this.fg.reset()
    }
  }



  onSubmit(){
    if(this.fg.invalid){
      this.fg.markAllAsTouched();
      return;
    }

    if(this.selectedItem){
         this.carouselService.putCarouselItem(this.fg.value).subscribe({
      next:(value) => {
          this.cleanValues()
          this.renderItems()
      },
      })
    }
    else{
      this.carouselService.postCarouselItem(this.fg.value).subscribe({
      next:(value) => {
          this.cleanValues()
          this.renderItems()
      },
      })
    }
  
  }

  onPreviewSelect(item: Carouselitem){
    this.selectedItem = item
    this.fg.patchValue(item)
  }

  onDelete(){
    this.carouselService.deleteCarouselItem(this.selectedItem!.id).subscribe({
      next:(value) => {
         this.cleanValues()
         this.renderItems()
      },
    })
  }

  initForm(){
  this.fg = this.fb.group({
    id:[''],
    title: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(80)]],
    href: ['', [Validators.required, Validators.pattern(/^(\/|https?:\/\/).+/)]],
    url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
    publishStart: [null],
    publishEnd: [null],
    publishStartTime: [''],
    publishEndTime: ['']
  });
  }

  createItem(){
    this.cleanValues()
  }

  cleanValues(){
    this.selectedItem = undefined
    this.fg.reset()
  }

  goBack(){
    this.router.navigate(['/auth','admin'])
  }

  showErrors(controlName: string): boolean {
    const control = this.fg.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  hasError(controlName: string, errorCode: string): boolean {
    const control = this.fg.get(controlName);
    return !!control && control.hasError(errorCode);
  }

}
