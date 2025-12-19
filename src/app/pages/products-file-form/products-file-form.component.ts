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
                    this.headers = Object.keys(data[0].data);
                    this.allPreviewData = data;
                    this.totalPages = Math.ceil(this.allPreviewData.length / this.pageSize);
                    this.currentPage = 1;
                    this.updateDisplayedData();
                } else {
                    this.resetPreview();
                }
            },
            error: (err) => {
                this.swal.error('Error al leer el archivo. Formato no válido de los campos ingresados');
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
            title: "Tutorial de Importación",
            icon: "info",
            html: `
                <div style="text-align: left; font-size: 0.9rem;">
                    <p>El archivo (Excel .xlsx o CSV) debe tener una fila de cabecera con los siguientes nombres exactos:</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem; border: 1px solid #ddd;">
                        <thead style="background-color: #f8f9fa;">
                            <tr>
                                <th style="border: 1px solid #ddd; padding: 8px;">Columna</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">Obligatorio</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">Tipo</th>
                                <th style="border: 1px solid #ddd; padding: 8px;">Descripción</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td style="border: 1px solid #ddd; padding: 8px;"><b>name</b></td><td style="border: 1px solid #ddd; padding: 8px; color: red;">Sí</td><td style="border: 1px solid #ddd; padding: 8px;">Texto</td><td style="border: 1px solid #ddd; padding: 8px;">Nombre del producto</td></tr>
                            <tr><td style="border: 1px solid #ddd; padding: 8px;"><b>brand</b></td><td style="border: 1px solid #ddd; padding: 8px;">No</td><td style="border: 1px solid #ddd; padding: 8px;">Texto</td><td style="border: 1px solid #ddd; padding: 8px;">Marca</td></tr>
                            <tr><td style="border: 1px solid #ddd; padding: 8px;"><b>sku</b></td><td style="border: 1px solid #ddd; padding: 8px; color: red;">Sí</td><td style="border: 1px solid #ddd; padding: 8px;">Texto</td><td style="border: 1px solid #ddd; padding: 8px;">Código único</td></tr>
                            <tr><td style="border: 1px solid #ddd; padding: 8px;"><b>stock</b></td><td style="border: 1px solid #ddd; padding: 8px; color: red;">Sí</td><td style="border: 1px solid #ddd; padding: 8px;">Número</td><td style="border: 1px solid #ddd; padding: 8px;">Cantidad disponible</td></tr>
                            <tr><td style="border: 1px solid #ddd; padding: 8px;"><b>price</b></td><td style="border: 1px solid #ddd; padding: 8px; color: red;">Sí</td><td style="border: 1px solid #ddd; padding: 8px;">Decimal</td><td style="border: 1px solid #ddd; padding: 8px;">Precio venta</td></tr>
                            <tr><td style="border: 1px solid #ddd; padding: 8px;"><b>unit_price</b></td><td style="border: 1px solid #ddd; padding: 8px;">No</td><td style="border: 1px solid #ddd; padding: 8px;">Decimal</td><td style="border: 1px solid #ddd; padding: 8px;">Costo unitario</td></tr>
                            <tr><td style="border: 1px solid #ddd; padding: 8px;"><b>categories</b></td><td style="border: 1px solid #ddd; padding: 8px;">No</td><td style="border: 1px solid #ddd; padding: 8px;">Texto</td><td style="border: 1px solid #ddd; padding: 8px;">Sep. por comas (ej. "TV,Sony")</td></tr>
                            <tr><td style="border: 1px solid #ddd; padding: 8px;"><b>img_url</b></td><td style="border: 1px solid #ddd; padding: 8px;">No</td><td style="border: 1px solid #ddd; padding: 8px;">URL</td><td style="border: 1px solid #ddd; padding: 8px;">Link a imagen</td></tr>
                            <tr><td style="border: 1px solid #ddd; padding: 8px;"><b>description</b></td><td style="border: 1px solid #ddd; padding: 8px;">No</td><td style="border: 1px solid #ddd; padding: 8px;">Texto</td><td style="border: 1px solid #ddd; padding: 8px;">Detalles</td></tr>
                             <tr><td style="border: 1px solid #ddd; padding: 8px;"><b>barcode</b></td><td style="border: 1px solid #ddd; padding: 8px; color: red;">Sí</td><td style="border: 1px solid #ddd; padding: 8px;">Texto</td><td style="border: 1px solid #ddd; padding: 8px;">Código barras</td></tr>
                        </tbody>
                    </table>

                    <p><b>Ejemplo CSV:</b></p>
                    <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto;">name,price,stock,categories
iPhone 13,999.99,50,"Celulares,Apple"
Samsung TV,500.00,20,"Electrónica,Hogar"</pre>
                </div>
            `,
            showCloseButton: true,
            focusConfirm: false,
            confirmButtonText: `<i class="fa fa-thumbs-up">Entendido!</i>`,
            confirmButtonAriaLabel: "Thumbs up, great!",
            width: "60rem"
        });
    }
}
