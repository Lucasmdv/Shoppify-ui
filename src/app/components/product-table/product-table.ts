import { Component, input, output } from '@angular/core';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product-service';
import { SwalService } from '../../services/swal-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-table',
  imports: [CommonModule],
  templateUrl: './product-table.html',
  styleUrl: './product-table.css'
})
export class ProductTable{
  isEditMode = input<boolean>(false)
  products = input<Product[]>()
  deleteEvent = output<void>()
  editEvent = output<Product>()

  constructor(
    private productService: ProductService,
    private swal: SwalService,
  ) {}

  deleteProduct(id: number): void {
    this.productService.delete(id).subscribe({
      next: () => {
        this.swal.success("Producto eliminado con exito!")
        this.deleteEvent.emit()
      },
      error: () => {
        this.swal.error("Ocurrio un error al eliminar el producto")
      }
    });
  }

  editProduct(product: Product) {
    this.editEvent.emit(product)
  }
}