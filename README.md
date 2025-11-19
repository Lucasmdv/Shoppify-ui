# Shoppify UI

Frontend en Angular 20 para la plataforma Shoppify. Ofrece catalogo publico, carrito, historial de compras y modulos administrativos (tienda, carrusel, productos y categorias) consumiendo la API HAL del backend Java.

## Caracteristicas principales
- **Componentes standalone** y layouts separados para Auth, Main y paginas de configuracion.
- **Catalogo enriquecido** con filtros avanzados (`ProductsRefiner`), paginacion y vistas tarjeta/tabla.
- **Carrito reactivo** basado en Angular Signals que valida stock en tiempo real antes de confirmar cantidades.
- **Flujo administrativo** con formularios modales (`MatDialog`) para productos, categorias, carrusel y datos de tienda.
- **Proteccion de rutas** mediante `authGuard`, `publicGuard` y `hasPermitsGuard`, respaldados por `AuthService`.
- **Experiencia de usuario** apoyada en CoreUI, Angular Material y SweetAlert2.

## Stack tecnologico
- Angular CLI 20.3.x + TypeScript 5.9 + RxJS 7.8
- Angular Material + CoreUI (`@coreui/angular`, `@coreui/coreui`, `@coreui/chartjs`)
- Chart.js + SweetAlert2 + Sass
- Prettier para formato consistente

## Requisitos previos
- Node.js 18.18+ (recomendado por Angular 20)
- Angular CLI global (`npm install -g @angular/cli`) opcional pero conveniente
- Backend Shoppify corriendo en `http://localhost:8080/api` o actualizar `src/environments/environment.ts`

## Puesta en marcha
```bash
npm install
npm start
# Navegar a http://localhost:4200
```

Para builds de produccion:
```bash
npm run build
```

## Scripts utiles
| Comando | Descripcion |
|---------|-------------|
| `npm start` | `ng serve` con recarga en caliente |
| `npm run watch` | Build incremental en modo development |
| `npm run build` | Compila a `dist/` con optimizaciones |
| `npm test` | Unit tests con Karma + Jasmine |

## Estructura basica
```
src/
  app/
     layouts/        (Auth, Main, ConfigPages)
     pages/          (home, products, admin, cart, purchases, help...)
     components/     (product-card, product-form-dialog, promotion-carousel...)
     services/       (auth, cart, store, carousel, create-product...)
     models/         (dominio + utilidades HAL)
     directives/     (image-fallback)
  environments/       (configuracion por ambiente)
```

## Integracion con la API
- `environment.apiUrl` apunta por defecto a `http://localhost:8080/api`.
- `BaseService<T>` centraliza llamadas REST y desempaqueta respuestas HAL (`_embedded`, `page`).
- Servicios concretos (`ProductService`, `CategoryService`, `CarouselService`, `TransactionService`, etc.) extienden esa base.
- `AuthService` + `StorageService` guardan token, permisos y usuario en `localStorage` para ser usados por guards.

## Documentacion ampliada
La descripcion completa de arquitectura, dependencias y flujos se encuentra en [`docs/documentacion.md`](docs/documentacion.md).

## Contribuir
- Sigue el formato definido en Prettier (`npx prettier --write src`).
- Manten los componentes como standalone e importa solo lo necesario.
- Anade modelos/servicios en `src/app/models` y `src/app/services` antes de tocar las paginas.
- Incluye pruebas unitarias (`*.spec.ts`) cuando agregues logica de negocio o guards nuevos.

---
Dudas o ideas? Crea un issue o abre un PR con una descripcion clara del cambio propuesto.
