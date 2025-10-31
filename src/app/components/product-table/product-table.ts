import { Component, input, OnInit, output } from '@angular/core';
import { Product } from '../../models/product';
import { Category } from '../../models/category';
import { ProductService } from '../../services/product-service';
import { CategoryService } from '../../services/category-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductParams } from '../../models/filters/productParams';
import { SwalService } from '../../services/swal-service';
import { TableDirective } from "@coreui/angular";

@Component({
  selector: 'app-product-table',
  imports: [TableDirective],
  templateUrl: './product-table.html',
  styleUrl: './product-table.css'
})
export class ProductTable{
  products = input<Product[]>()
  deleteOutput = output<void>()

  constructor(
    private productService: ProductService,
    private swal: SwalService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  deleteProduct(id: number): void {
    this.productService.delete(id).subscribe({
      next: () => {
        this.swal.success("Producto eliminado con exito!")
        this.deleteOutput.emit()
      },
      error: (err) => {
        this.swal.error("Ocurrio un error al eliminar el producto")
      }
    });
  }

  editProduct(id: number) {
    this.router.navigate([`/products/edit/${id}`])
  }
}