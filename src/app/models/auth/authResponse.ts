import { User } from "./user"

export interface AuthResponse {
    token: string
    user: User
    permits: string[]
    roles: string[]
}