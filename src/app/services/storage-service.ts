import { Injectable } from '@angular/core';
import { User } from '../models/auth/user';

@Injectable({
  providedIn: 'root'
})
export class StorageService {


  setSession(token: string, permits: string[], roles: string[], user: User) {
    try {
      localStorage.setItem('token', token)
      localStorage.setItem('permits', JSON.stringify(permits))
      localStorage.setItem('roles', JSON.stringify(roles))
      localStorage.setItem('user', JSON.stringify(user))
    } catch (e) {/* almacenamiento no soportado/bloqueado */}
  }

  clearSession() {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('permits')
      localStorage.removeItem('roles')
      localStorage.removeItem('user')
    } catch (e) {/* nada que limpiar o acceso denegado */}
  }

  getToken() {
    try {
      return localStorage.getItem('token') || ''
    } catch (e) { return '' }
  }

  getPermits() {
    try {
      return JSON.parse(localStorage.getItem('permits') || '[]')
    } catch (e) { return [] }
  }

  getRoles() {
    try {
      return JSON.parse(localStorage.getItem('roles') || '[]')
    } catch (e) { return [] }
  }

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null')
    } catch (e) { return null }
  }

  setUser(user: User | null) {
    if (!user) {
      localStorage.removeItem('user')
      return
    }
    localStorage.setItem('user', JSON.stringify(user))
  }
}
