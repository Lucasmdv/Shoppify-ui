import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ProductService } from '../../services/product-service';
import { Router } from '@angular/router';
import { SwalService } from '../../services/swal-service';

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
        private swal: SwalService
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
}
