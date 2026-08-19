# AGENTS.md

## Contexto real del proyecto

Este repo hoy no es una web corporativa ni una app fullstack con backend amplio.

Es un catalogo online tipo SaaS para emprendedores y tiendas chicas. La app permite:

- iniciar sesion con Google usando Firebase Auth desde cliente
- crear o recuperar el documento del usuario en Firestore
- administrar productos, categorias, cupones y configuracion desde un panel
- mostrar un catalogo publico general y una tienda publica por usuario
- filtrar productos por categoria, ofertas y stock
- armar un carrito y enviar pedidos por WhatsApp desde el flujo publico

No asumir arquitectura enterprise, App Router, Tailwind, server actions, Firebase Admin ni APIs complejas si no aparecen explicitamente en el codigo real.

## Mapa real del codigo

- `src/pages/_app.js`: entrada global, monta `Context` y `Layout`
- `src/componentes/Layout.jsx`: layout base con `Head`, `Navbar`, `Carrito` y `Footer`
- `src/servicios/context.js`: estado global, sesion, lectura de Firestore, carrito y helpers compartidos
- `src/servicios/contextPrincipal.jsx`: contexto React compartido
- `src/servicios/firebase.js`: inicializacion client-side de Firebase con `NEXT_PUBLIC_*`
- `src/pages/index.jsx`: home publica y entrada comercial del producto
- `src/pages/login/index.jsx`: acceso con Google
- `src/pages/panel-de-control/index.jsx`: panel de administracion de la tienda
- `src/pages/productos/index.jsx`: catalogo publico general
- `src/pages/productos/[producto].jsx`: detalle publico de producto
- `src/pages/u/[user].jsx`: tienda publica por usuario
- `src/componentes/configuracion/Configuracion.jsx`: configuracion visible desde panel
- `src/componentes/productos/*`: render del catalogo y tarjetas de producto
- `src/pages/api/hello.js`: unica API route real del repo hoy
- `src/styles/*.module.scss` y `src/styles/globals.css`: estilos globales y por modulo

## Stack actual

Este proyecto trabaja hoy con:

- Next.js 13.2.4
- React 18.2.0
- Pages Router
- SCSS Modules
- Firebase Web SDK
- Framer Motion
- Sonner
- ImageKit client SDK
- `browser-image-compression`
- `react-icons`
- `react-scroll`

No asumir Tailwind, App Router, TypeScript, endpoints server-side complejos, Prisma, Mercado Pago ni Firebase Admin salvo que despues aparezcan explicitamente en el codigo.

## Arquitectura importante

### 1. Entrada global

- `src/pages/_app.js` envuelve toda la app con `Context` y `Layout`
- cualquier cambio ahi impacta home, login, panel, catalogo y tienda publica
- no romper el orden `Context -> Layout -> Component`

### 2. Layout global

- `src/componentes/Layout.jsx` monta `Head`, `Navbar`, `Carrito` y `Footer`
- el estado de apertura del carrito vive ahi
- no romper el scroll lock en mobile ni la presencia global del carrito sin pedido explicito
- cualquier cambio de metadatos o fuentes afecta todo el sitio

### 3. Auth y sesion

El flujo actual es:

- el login usa `signInWithPopup` con Google desde cliente
- `src/servicios/context.js` escucha `onAuthStateChanged`
- si el usuario no existe en `users/{email}`, lo crea con un shape inicial
- luego carga datos de Firestore y actualiza el estado global

Esto implica reglas concretas:

- no mover credenciales privadas al cliente
- no asumir que `context.user`, `estadoUsuario` o `loader` ya estan listos al montar
- no romper la redireccion al home o panel al tocar guards de sesion
- no mezclar logica de login puntual dentro de muchos componentes si ya existe en `context.js`

### 4. Estado global y Firestore

`src/servicios/context.js` concentra gran parte del comportamiento real:

- productos privados del usuario
- productos publicos filtrados
- cupones
- secciones
- configuracion
- nombre de tienda
- premium
- carrito
- loader global

Hoy el documento `users/{email}` contiene, entre otras cosas:

- `items`
- `cupones`
- `secciones`
- `usuario`
- `configuracion`
- `premium`

Reglas:

- no cambiar esos nombres de campos sin revisar todos los consumidores
- no asumir una capa de datos separada; hoy mucha logica vive en `context.js`
- si cambias shape de `items`, `cupones`, `secciones` o `configuracion`, revisar panel y vistas publicas juntas

### 5. Tienda publica por usuario

`src/pages/u/[user].jsx` no carga por email sino consultando `users` por el campo `usuario`.

Esto implica:

- no cambiar el significado de `usuario` sin revisar rutas publicas y navegacion
- no romper la consulta `where("usuario", "==", user)`
- si cambias el nombre visible de la tienda o sus campos publicos, revisar tambien `Perfil`, panel y `Layout`

### 6. Catalogo y detalle de producto

Las vistas publicas clave son:

- `src/pages/productos/index.jsx`
- `src/pages/productos/[producto].jsx`
- `src/componentes/productos/*`

Reglas:

- mantener consistente el filtro por categoria, ofertas y stock
- no romper el contrato de `id`, `seccion`, `precio`, `precioDescuento`, `descuento`, `stock`, `img`
- el detalle de producto depende de arrays ya cargados en contexto; si cambias el flujo de carga, revisar fallback y estados vacios
- no romper la logica del carrito al tocar stock o cantidades

### 7. Panel de control

`src/pages/panel-de-control/index.jsx` hoy concentra mucho comportamiento:

- guard de sesion
- cambio de secciones del panel
- apertura de modal de producto nuevo
- render de configuracion, productos y descuentos

Reglas:

- no redisenar el panel completo para resolver un ajuste puntual
- si cambias `showSeccion` o el orden de vistas, revisar menu desktop y mobile
- mantener la carga de datos y el guard de login funcionando antes de tocar UI secundaria

### 8. Estilos

La base actual usa `SCSS modules`, no Tailwind.

Esto implica:

- si un componente ya usa `*.module.scss`, seguir ese patron
- usar `globals.css` solo para reglas verdaderamente globales
- no mezclar varios enfoques de estilos en el mismo cambio sin necesidad real
- si aparece mojibake o texto roto, corregirlo antes de cerrar la tarea

## Reglas de trabajo obligatorias

### Regla principal: aprobacion antes de actuar

- nunca pushear al repo sin aprobacion explicita del usuario para ese push concreto
- nunca commitear sin aprobacion explicita del usuario para ese commit concreto
- antes de hacer cualquier cambio de codigo, configuracion, dependencias, estilos, rutas, datos o scripts, explicar primero:
  - que se entendio
  - que se va a hacer
  - que archivos o documentos probablemente se van a tocar
  - que partes no se van a tocar
  - si afecta UI, datos, auth, Firestore, rutas, dependencias, deploy o build
  - cual es el riesgo principal
  - como se va a verificar
- despues de esa explicacion, esperar aprobacion explicita del usuario antes de avanzar con ediciones
- una aprobacion para editar no implica aprobacion para commitear ni pushear
- una aprobacion para commitear no implica aprobacion para pushear
- si el usuario pide solo analizar, revisar, explicar o relevar, no modificar archivos

### 9. Antes de tocar cualquier cosa

El proceso esperado es:

- explicar que se entendio
- decir que se va a hacer
- nombrar que archivos probablemente se van a tocar
- aclarar que partes no se van a tocar
- marcar si afecta UI, datos, auth, Firestore, rutas o build
- decir cual es el riesgo principal
- decir como se va a verificar

Despues de explicar eso, pedir y esperar aprobacion explicita antes de editar cualquier archivo. No avanzar con cambios por inferencia.

### 10. Cambios minimos y seguros

- hacer cambios chicos
- no refactorizar modulos enteros para arreglar un detalle puntual
- respetar la arquitectura actual antes que imponer una nueva
- no cambiar nombres de campos de Firestore sin necesidad real
- no mover logica global fuera de `context.js` si el pedido no lo requiere
- no tocar `package-lock.json` salvo que cambien dependencias
- todo archivo editado debe quedar en UTF-8 valido y sin mojibake

### 11. Al terminar un cambio

Siempre resumir:

- que se cambio
- que impacto tiene
- que deberia probar el usuario
- que riesgos o casos borde siguen abiertos
- si quedo deuda tecnica pendiente

## Seguridad y secretos

### 12. Archivos y variables sensibles

No leer, imprimir, pegar ni modificar:

- `.env`
- `.env.*`
- `.env.local`

Tampoco exponer:

- tokens
- secrets
- cookies
- claves privadas
- valores concretos de variables de entorno

### 13. Regla critica cliente vs configuracion publica

- `src/servicios/firebase.js` usa variables `NEXT_PUBLIC_*`, eso es normal para Firebase cliente
- no agregar credenciales privadas nuevas en componentes client-side
- si una integracion futura necesita secretos reales, moverla a una API route server-side
- no asumir que ya existe una capa server-side lista para secretos: hoy casi no existe

## Datos, rutas y contratos

### 14. Rutas internas relevantes

Hoy las rutas visibles del repo son:

- `/`
- `/login`
- `/panel-de-control`
- `/productos`
- `/productos/[producto]`
- `/u/[user]`
- `/api/hello`

Si agregas o cambias rutas:

- actualizar navegacion y links internos
- revisar redirecciones de sesion
- revisar componentes que dependen de `router.query`

### 15. Contratos que no conviene romper

- `context.js` espera `users/{email}` con `items`, `cupones`, `secciones`, `usuario`, `configuracion` y `premium`
- `Layout.jsx` espera poder abrir y cerrar `Carrito` globalmente
- `productos/[producto].jsx` espera `id` de producto estable
- `u/[user].jsx` espera que la tienda publica se resuelva por `usuario`
- el catalogo publico muestra solo productos con `stock > 0`

Si cambias un contrato, actualizar todos los consumidores dentro del mismo cambio.

## UX y consistencia visual

### 16. UI y coherencia

- mantener la estetica actual del proyecto salvo pedido explicito de redisenio
- cuidar desktop y mobile
- no agregar animaciones porque si
- si el archivo ya usa Framer Motion, seguir ese patron con moderacion
- no mezclar copy nuevo con texto roto o encoding defectuoso

## Verificacion minima

Al cerrar una tarea, verificar lo que aplique:

- `npm run lint`
- `npm run build`
- prueba manual de login si tocaste `src/pages/login/index.jsx` o `src/servicios/context.js`
- prueba manual del panel si tocaste `src/pages/panel-de-control/index.jsx` o componentes del panel
- prueba manual de catalogo publico si tocaste `src/pages/productos/*` o `src/componentes/productos/*`
- prueba manual de tienda publica si tocaste `src/pages/u/[user].jsx` o `Perfil`
- caso feliz y al menos un caso borde

Si una verificacion no puede correrse o falla por un problema previo del proyecto, decirlo explicitamente.

## Que evitar

- no tocar `.next` ni `node_modules`
- no inventar servicios o modulos que no existen
- no asumir una API server-side que hoy no existe
- no reescribir `context.js` completo salvo pedido explicito
- no mezclar Firebase client con secretos privados
- no hacer un redisenio completo cuando el pedido es funcional

## Prioridades del agente

Cuando haya varias mejoras posibles, priorizar en este orden:

1. bugs funcionales
2. integridad de auth y guards
3. integridad de Firestore y del shape de `users/{email}`
4. estabilidad del catalogo publico y carrito
5. robustez del panel de control
6. UX y feedback
7. performance razonable
8. limpieza tecnica secundaria

