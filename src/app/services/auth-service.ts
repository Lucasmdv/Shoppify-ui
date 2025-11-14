import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed, inject } from '@angular/core';
import { RegisterPayload } from '../models/auth/registerPayload';
import { AuthResponse } from '../models/auth/authResponse';
import { environment } from '../../environments/environment';
import { Credentials } from '../models/auth/credentials';
import { StorageService } from './storage-service';
import { Router } from '@angular/router';
import { User } from '../models/auth/user';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient)
  private storageService = inject(StorageService)
  private router = inject(Router)

  user = signal<User | null>(null)
  permits = signal<string[]>([])
  token = signal<string | null>(null)
  isLogged = computed(() => !!this.token())

  readonly API_URL = `${environment.apiUrl}/auth`

  constructor() {
    this.restoreSession()
  }

  private restoreSession() {
    this.user.set(this.getUser())
    this.permits.set(this.getPermits())
    const tk = this.getToken()
    this.token.set(tk || null)
  }

  register(payload: RegisterPayload) {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, payload)
  }

  login(credential: Credentials) {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credential)
  }

  setSession(token: string, permits: string[], user: User) {
    this.storageService.setSession(token, permits, user)
    this.user.set(user)
    this.permits.set(permits)
    this.token.set(token)
  }

  logout() {
    this.storageService.clearSession()
    this.user.set(null)
    this.token.set(null)
    this.permits.set([])
    this.router.navigate([""])
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
}

