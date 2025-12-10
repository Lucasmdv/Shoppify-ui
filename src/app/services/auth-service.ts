import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed, inject } from '@angular/core';
import { RegisterPayload } from '../models/auth/registerPayload';
import { AuthResponse } from '../models/auth/authResponse';
import { environment } from '../../environments/environment';
import { Credentials } from '../models/auth/credentials';
import { StorageService } from './storage-service';
import { Router } from '@angular/router';
import { User } from '../models/auth/user';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient)
  private storageService = inject(StorageService)
  private router = inject(Router)

  user = signal<User | null>(null)
  permits = signal<string[]>([])
  roles = signal<string[]>([])
  token = signal<string | null>(null)
  private userPayload = signal<any>(null);
  isLogged = computed(() => !!this.token())

  readonly API_URL = `${environment.apiUrl}/auth`

  constructor() {
    this.restoreSession()
  }

  private restoreSession() {
    this.loadUserPayload();
    this.user.set(this.getUser())
    this.permits.set(this.getPermits())
    this.roles.set(this.getRolesFromStorage())
    const tk = this.getToken()
    this.token.set(tk || null)
  }

  private loadUserPayload(): void {
    const token = this.getToken();
    if (token) {
      try {
        this.userPayload.set(jwtDecode(token));
      } catch (e) {
        console.error("Error decodificando el token", e);
        this.logout();
      }
    }
  }


  register(payload: RegisterPayload) {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, payload)
  }

  login(credential: Credentials) {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credential)
  }

  setSession(token: string, permits: string[], roles: string[], user: User) {
    this.storageService.setSession(token, permits, roles, user);
    this.loadUserPayload();
    this.user.set(user);
    this.permits.set(permits);
    this.roles.set(roles);
    this.token.set(token);
  }

  logout() {
    this.storageService.clearSession();
    this.user.set(null);
    this.token.set(null);
    this.permits.set([]);
    this.roles.set([]);
    this.userPayload.set(null);
    this.router.navigate([""]);
  }

  getPermissions(): string[] {
    return this.permits();
  }

  hasPermission(requiredPermission: string): boolean {
    return this.getPermissions().includes(requiredPermission);
  }

  hasAnyPermission(requiredPermissions: string[]): boolean {
    const userPermissions = this.getPermissions();
    return requiredPermissions.some(p => userPermissions.includes(p));
  }

  getRoles(): string[] {
    return this.roles();
  }

  hasRole(requiredRole: string): boolean {
    return this.getRoles().includes(requiredRole);
  }

  hasAnyRole(requiredRoles: string[]): boolean {
    const userRoles = this.getRoles();
    return requiredRoles.some(r => userRoles.includes(r));
  }

  private getUser() {
    return this.storageService.getUser()
  }

  private getToken() {
    return this.storageService.getToken()
  }

  private getPermits() {
    return this.storageService.getPermits()
  }

  private getRolesFromStorage() {
    return this.storageService.getRoles()
  }

  updateUser(user: User | Partial<User>) {
    const current = this.user();
    const nextUser: User = current ? { ...current, ...user } : user as User;
    this.storageService.setUser(nextUser)
    this.user.set(nextUser)
  }

  updateCredential(newEmail?: string, newPassword?: string) {
    const payload: any = {}
    const token = this.token()

    if (newEmail) payload.newEmail = newEmail
    if (newPassword) payload.newPassword = newPassword

    if (!token) {
      console.warn('No hay token disponible. El usuario debe iniciar sesión nuevamente.')
      this.logout()
      this.router.navigate(['/auth/login'])
      throw new Error('Token no disponible')
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    }

    return this.http.patch<AuthResponse>(`${this.API_URL}/update`, payload, { headers })
  }

  isTokenValid(): boolean {
    const token = this.token();
    if (!token) {
      return false;
    }

    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      console.error('Error verificando token:', error);
      return false;
    }
  }
}

