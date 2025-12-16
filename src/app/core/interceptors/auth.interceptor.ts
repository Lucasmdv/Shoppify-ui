import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth-service';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private authService = inject(AuthService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.token();
    const needsNgrokBypass = environment.apiUrl.includes('ngrok');
    let headers = req.headers;

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    if (needsNgrokBypass && req.url.startsWith(environment.apiUrl)) {
      headers = headers.set('ngrok-skip-browser-warning', 'true');
    }

    const requestWithHeaders = headers === req.headers ? req : req.clone({ headers });
    return next.handle(requestWithHeaders);
  }
}
