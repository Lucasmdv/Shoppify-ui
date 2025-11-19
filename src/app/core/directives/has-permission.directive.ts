import { Directive, Input, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthService } from '../../services/auth-service';


@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private authService = inject(AuthService)
  private templateRef = inject(TemplateRef<any>)
  private viewContainer = inject(ViewContainerRef)

  private requiredPermissions: string[] = [];
  private hasView = false;

  constructor() {
    effect(() => {
      this.checkPermissions()
    })
  }

  @Input('appHasPermission')
  set permissions(value: string | string[]) {
    this.requiredPermissions = Array.isArray(value) ? value : [value]
    this.checkPermissions()
  }

  private checkPermissions(): void {
    const userPermits = this.authService.permits()
    const hasPermission = this.requiredPermissions.some(p => userPermits.includes(p))

    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef)
      this.hasView = true
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear()
      this.hasView = false
    }
  }
}
