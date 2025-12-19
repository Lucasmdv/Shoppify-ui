import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ProductService } from '../../services/product-service';
import { Router } from '@angular/router';
import { SwalService } from '../../services/swal-service';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-products-file-form',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './products-file-form.component.html',
    styleUrl: './products-file-form.component.css'
})
export class ProductsFileForm {
    selectedFile: File | null = null;
    allPreviewData: any[] = [];
    previewData: any[] = [];
    headers: string[] = [];
    isLoading = false;

    currentPage = 1;
    pageSize = 10;
    totalPages = 0;

    constructor(
        private productService: ProductService,
        private router: Router,
        private location: Location,
        private swal: SwalService,
        private dialog: MatDialog
    ) { }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
            this.previewFile();
        }
    }

    previewFile() {
        if (!this.selectedFile) return;

        this.productService.previewFile(this.selectedFile).subscribe({
            next: (data) => {
                if (data && data.length > 0) {
                    this.headers = Object.keys(data[0]);
                    this.allPreviewData = data;
                    this.totalPages = Math.ceil(this.allPreviewData.length / this.pageSize);
                    this.currentPage = 1;
                    this.updateDisplayedData();
                } else {
                    this.resetPreview();
                }
            },
            error: (err) => {
                this.swal.error('Error al leer el archivo');
                console.error(err);
                this.resetPreview();
            }
        });
    }

    updateDisplayedData() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.previewData = this.allPreviewData.slice(startIndex, endIndex);
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updateDisplayedData();
        }
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updateDisplayedData();
        }
    }

    resetPreview() {
        this.allPreviewData = [];
        this.previewData = [];
        this.headers = [];
        this.totalPages = 0;
        this.currentPage = 1;
    }

    uploadFile() {
        if (!this.selectedFile) return;

        this.isLoading = true;
        this.productService.importProducts(this.selectedFile).subscribe({
            next: () => {
                this.isLoading = false;
                this.swal.success('Productos importados correctamente');
                this.router.navigate(['/products']);
            },
            error: (err: any) => {
                this.isLoading = false;
                this.swal.error('Error al importar productos');
                console.error(err);
            }
        });
    }

    cancel() {
        this.location.back()
    }

    help() {
        Swal.fire({
            title: "Tutorial",
            icon: "info",
            html: `
                <ol style="text-align: left;">
                    <li> Genera un archivo excel con las columnas: 
                        <ul>
                            <li>discount_percentage</li>
                            <li>price</li>
                            <li>unit_price</li>
                            <li>sold_quantity</li>
                            <li>stock_quantity</li>
                            <li>barcode</li>
                            <li>brand</li>
                            <li>img_url</li>
                            <li>name</li>
                            <li>sku</li>
                            <li>description</li>
                        </ul>
                    </li>
                    <li>Exporta el archivo como csv</li>
                    <li>Arrastra el csv o seleccionalo desde tus archivos haciendo click en el rectangulo punteado</li>
                    <li>Listo! Si hiciste todo correctamente vas a ver una tabla de previsualización con todos los productos a agregar</li>
                    <li>Haz click en importar</li>
                </ol>
            `,
            showCloseButton: true,
            focusConfirm: false,
            confirmButtonText: `<i class="fa fa-thumbs-up">Entendido!</i>`,
            confirmButtonAriaLabel: "Thumbs up, great!",
            width: "60rem"
        });
    }
}
