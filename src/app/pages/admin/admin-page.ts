import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { type ChartData } from 'chart.js';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { ProductService } from '../../services/product-service';
import { ProductParams } from '../../models/filters/productParams';
import { CreateProduct } from '../../services/create-product';
import { ScreenSizeService } from '../../services/screen-size-service';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [RouterLink,ChartjsComponent],
  templateUrl: './admin-page.html',
  styleUrls: ['./admin-page.css'],
  encapsulation: ViewEncapsulation.None
})
export class AdminPage implements OnInit {

  screenSizeService = inject(ScreenSizeService)
  
  constructor(
  private productService: ProductService,
  private createProductService: CreateProduct,
  private router: Router
  ){}

  data?: ChartData

  ngOnInit(): void {
this.getData()
  }

getData() {
    const params: ProductParams = {
      sort: "soldQuantity,desc",
      page: 0,
      size: 8
    }
    this.productService.getList(params).subscribe({
      next: (value) => {

        const productNames = value.data.map(product => product.name);
        const soldQuantities = value.data.map(product => product.soldQuantity);
       
        this.data = {
          labels: productNames,
          datasets: [
            {
              label: 'Productos más vendidos',
              backgroundColor: '#5f56c2ff',
              borderColor: '#5f56c2',
              data: soldQuantities 
            }
          ]
        };


        

        

      },
    })
  }


  createProduct() {
    if (this.screenSizeService.isScreenSmall()) {
      this.createProductService.setData([], []);
      this.router.navigate(['/product-form']);
    } else {
      this.createProductService.openDialog([], [], {}, () => { })
    }
  }

}
