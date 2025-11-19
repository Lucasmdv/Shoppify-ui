import { Component, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { Product } from '../../models/product';
import { UserService } from '../../services/user-service';
import { Router } from '@angular/router';
import { User } from '../../models/auth/user';
import { EditProfileForm } from '../../components/edit-profile-form/edit-profile-form';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth-service';
import Swal from 'sweetalert2';
import { ImageFallbackDirective } from "../../core/directives/image-fallback";

@Component({
  selector: 'app-profile',
  imports: [ImageFallbackDirective],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  encapsulation: ViewEncapsulation.None
})
export class Profile implements OnInit {

  id?: number
  user!: User;
  wishList: Product[] = [];
  displayCount = 4;

  constructor(
    private uService: UserService,
    private router: Router,
    private dialog: MatDialog,
    private aService: AuthService
  ) {}

  ngOnInit() {
    
    this.renderProfile()
  }

  renderProfile(){
    this.id = this.aService.user()?.id
    this.uService.get(this.id!).subscribe({
      next: u => {
        this.user = u
        console.log(u)
      },
      error: (e) => {
        console.log(e)
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Ocurrio un error al cargar el perfil",
        })
        this.router.navigate(["/"])
      }
    })
  }

  editarPerfil() {
    const dialogRef = this.dialog.open(EditProfileForm, {
      width: '80vw',
      data: this.user,
      disableClose: true,
      panelClass: 'contenedor'
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.uService.patch(result).subscribe({
          next: () => {
            this.user = result
            Swal.fire({
              icon: "success",
              title: "Éxito",
              text: "Perfil actualizado con éxito."
            })
          },
          error: e => console.error('Error al actualizar el perfil', e)
        })
      }
    })
  }

  editarConfiguracion() {
    this.router.navigate(["/auth/settings"])
  }

  verCompras() {
    this.router.navigate(["/purchases"])
  }

  ayuda() {
    this.router.navigate(["/help"])
  }

  verMas() {
    this.router.navigate([""]) //TODO cuando agreguemos wishlist
  }
}
