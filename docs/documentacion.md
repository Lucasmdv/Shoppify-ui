# Documentacion funcional de Shoppify UI

## 1. Resumen
- **Shoppify UI** es el frontend Angular (CLI 20.3.x) del ecosistema Shoppify, orientado a comercio electronico B2C con herramientas de administracion.
- Todo el codigo usa **componentes standalone** y modulos funcionales (layouts, pages, components, services).
- La aplicacion consume una API HAL (`environment.apiUrl = http://localhost:8080/api`) y persiste sesion via `localStorage`.
- Se apoya en **CoreUI**, **Angular Material**, **Chart.js** y **SweetAlert2** para componer la experiencia visual.

## 2. Stack y dependencias clave
| Tipo | Libreria / herramienta | Uso dentro del proyecto |
|------|-----------------------|--------------------------|
| Framework | `@angular/core` 20.3.x | Componentes standalone, signals y DI |
| UI | `@angular/material` | Formularios, dialogos (`MatDialog`), inputs |
| UI complementaria | `@coreui/angular`, `@coreui/coreui`, `@coreui/chartjs` | Layout responsivo, carruseles, paginacion y graficos |
| Visualizaciones | `chart.js` | Reportes administrativos (p.ej. Dashboard) |
| Notificaciones | `sweetalert2`, `@sweetalert2/ngx-sweetalert2` | Alertas/Toasts encapsulados en `SwalService` |
| Estado reactivo | `@angular/core` signals, `rxjs` | Signals en `AuthService`, `CartService` y flujos HTTP |
| Estilos | `sass` | Tema global (`src/styles.scss`) |
| Calidad | `prettier` | Formato consistente (`printWidth: 100`, `singleQuote: true`) |

Scripts disponibles (`package.json`):
- `npm start` / `ng serve`: servidor local.
- `npm run build`: build de produccion (salida en `dist/`).
- `npm run watch`: build incremental modo development.
- `npm test`: unit tests con Karma + Jasmine.

## 3. Arquitectura y organizacion
```
src/app
  layouts/        -> Contenedores Auth, Main y ConfigPages
  pages/          -> Vistas completas (home, products, admin, cart, etc.)
  components/     -> Bloques reutilizables (product-card, promotion-carousel...)
  services/       -> Acceso HTTP + logica de dominio (auth, cart, store...)
  models/         -> Tipos de dominio + modelos HAL
  directives/     -> Directivas personalizadas (image-fallback)
  core/guards     -> Guards de autenticacion/roles
```

### 3.1 Layouts
- **Auth** (`/auth`): login, registro, formularios de credenciales, vistas admin protegidas.
- **Main** (`/`): home, catalogo, detalle de producto, categorias, carrito y compras.
- **ConfigPages**: comparte estructura para perfil, ayuda, terminos y privacidad.

### 3.2 Ruteo
- Definido en `src/app/app.routes.ts`.
- Guards:
  - `authGuard`: exige sesion activa.
  - `publicGuard`: evita que usuarios autenticados vuelvan a `/auth`.
  - `hasPermitsGuard`: valida permisos especificos para editar tienda/carrusel.
- Las rutas de productos reutilizan `ProductsPage` para modo listado y resultados de busqueda (`/products/search/:q`).
- Rutas informativas (`/help`, `/help/terms`, `/help/privacy`) se agrupan bajo `ConfigPages`.

### 3.3 Componentes destacados
- **PromotionCarousel** (CoreUI Carousel + `ImageFallbackDirective`) para campanas hero.
- **ProductCard** y **ProductTable**: vista de catalogo en modo tarjeta o tabla administrativa; ambos comparten `Product` model.
- **ProductsRefiner**: formulario reactivo con validaciones que sincroniza filtros con query params (ordenacion, rango de precios y descuentos, categorias multiples).
- **SearchBar**, **CategoryCard**, **CategoryRefiner**: refinamiento transversal.
- **ProductFormDialog**, **CategoryForm/Dialog**, **StoreForm**, **CarouselForm**: formularios modales para CRUD usando `MatDialog`.
- **Header/HeaderAuth/HeaderConfig** y `Footer`/`FooterAuth`: adaptan navegacion segun layout.
- **UserAvatar**: muestra iniciales/foto con fallback cuando procede.

### 3.4 Servicios y modelos HAL
- `BaseService<T>` centraliza llamadas REST (`getList`, `get`, `post`, `put`, `patch`, `delete`), anade soporte de paginacion y desempaquetado HAL (`_embedded`, `page`).
- Modelos HAL (`src/app/models/hal`) definen `ResponseJSON`, `PaginatedResponse`, `Page`, `Links`.
- Servicios especializados (`ProductService`, `CategoryService`, `StoreService`, `CarouselService`, `TransactionService`, `CreateProduct/CreateCategory`) extienden `BaseService` o encapsulan llamadas particulares.

### 3.5 Estado y sesion
- **AuthService**: usa signals (`user`, `token`, `permits`) + `StorageService` para persistir sesion en `localStorage`. Expone helpers para login, registro, actualizacion de credenciales y restore automatico.
- **CartService**: maneja carrito totalmente en front (signals para items, totales) y sincroniza stock real consultando API antes de confirmar cantidad. Prepara `SaleRequest` para `TransactionService`.
- **StoreService**: obtiene configuracion de tienda (`/stores/singleton`) y la deja disponible como signal.

### 3.6 Directivas/utilidades
- `ImageFallbackDirective`: aplica placeholder dinamico cuando una `<img>` falla, con etiqueta basada en `name` o `alt`.
- `SwalService`: encapsula SweetAlert2 con mensajes de exito/error consistentes.

## 4. Flujos funcionales
1. **Autenticacion**: `/auth/login` y `/auth/register` consumen `AuthService`. Tras login exitoso se guarda token/permisos/usuario y se redirige a `home`.
2. **Descubrimiento de productos**:
   - Home muestra carrusel + destacados (`PromotionCarousel`, `ProductCard`).
   - `/products` permite filtrar por nombre, marca, multiple categoria, rangos de precio/descuento y ordenaciones. Los filtros se reflejan en la URL.
   - `/products/details/:id` (no abierto en tabs, pero existe) muestra fichas completas.
3. **Carrito y compras**:
   - `CartService` garantiza stock antes de sumar items; recalcula totales y prepara payloads de venta (`SaleRequest`).
   - Pagina `purchases` consume `TransactionService` para historial.
4. **Administracion**:
   - `AdminPage` reune formularios para gestionar tienda, carrusel, productos y categorias.
   - Formularios reutilizan servicios `CreateProduct`, `CreateCategory`, `StoreService`, `CarouselService`.
   - Guards de permisos bloquean rutas `/auth/admin/edit/*` si el usuario no posee `hasPermits`.
5. **Configuracion personal**:
   - `Profile` muestra/edita datos basicos; `CredentialsForm` permite actualizar email/contrasena (PATCH `/auth/update` con token).
6. **Paginas informativas**: `Help`, `Terms`, `Privacy` se sirven desde `ConfigPages` y no requieren autenticacion.

## 5. Comunicacion con la API
- Todas las llamadas pasan por `HttpClient`.
- Se respeta convencion REST `api/{recurso}`; ejemplo `environment.apiUrl + '/products'`.
- Los endpoints devuelven estructuras HAL (`{ _embedded: { responseList: [...] }, page: {...} }`). `BaseService.unwrapEmbeddedList` obtiene la lista independientemente del nombre del recurso.
- Logica adicional:
  - `CreateProduct` y `CreateCategory` orquestan modales y validaciones antes de `post`.
  - `TransactionService` agrupa endpoints administrativos (ver `src/app/services`).
- `SwalService` centraliza los mensajes de exito/error mostrados al usuario final.

## 6. Estilos y UX
- Tema base en `src/styles.scss`: reset global, layout flexible para `app-root` y `router-outlet`.
- Se importan estilos CoreUI y ChartJS (`@use '@coreui/coreui/scss/coreui'`).
- Clase `.swal2-toast-dark` define styling coherente con marca violeta (#7c3aed).
- Componentes individuales tienen sus propios `.css`/`.scss`, favoreciendo encapsulacion.
- Formularios usan `ReactiveFormsModule` + validators; se combinan con `MatFormField` para feedback inmediato.

## 7. Configuracion y ambientes
- `src/environments/environment.ts` expone:
  ```ts
  export const environment = {
    production: false,
    apiUrl: 'http://localhost:8080/api',
    appName: 'Shoppify-UI'
  }
  ```
- Para builds productivos agregar `environment.prod.ts` (no incluido) con URL y flags finales.
- Proxy opcional (`proxy.conf.json`) permite redirigir `/api` a backend durante desarrollo (`ng serve --proxy-config proxy.conf.json`).

## 8. Puesta en marcha
1. `npm install`
2. `npm start` (o `ng serve --open`)
3. Backend Java (repo `Shoppify`) debe estar corriendo en `localhost:8080`. Ajustar `environment.apiUrl` si cambia el puerto/base path.
4. Para crear build productivo: `npm run build`.
5. Pruebas unitarias: `npm test` (Karma abre ChromeHeadless si esta configurado).

## 9. Guia de contribucion rapida
- Respetar el formato Prettier (ejecutar `npx prettier --write src` antes de commitear).
- Para nuevos recursos de API:
  1. Crear modelo en `src/app/models`.
  2. Extender `BaseService` si sigue CRUD clasico.
  3. Anadir rutas/componentes standalone y registrarlos en `app.routes.ts`.
  4. Aprovechar signals para estado local y evitar `Subject`s cuando alcance con `computed`.
- Mantener componentes aislados (standalone) importando solo lo necesario.
- Documentar cada guard o servicio con tests en la carpeta paralela (`*.spec.ts`).

## 10. Proximos pasos sugeridos
- Anadir `environment.prod.ts` y variables `.env` para despliegues automatizados.
- Configurar `ng test --watch=false --code-coverage` dentro de CI.
- Unificar temas (Material + CoreUI) creando tokens de color compartidos.

---
Esta documentacion resume que se usa, como esta organizado el codigo y cuales son los flujos principales para que nuevos colaboradores puedan extender Shoppify UI con rapidez.
