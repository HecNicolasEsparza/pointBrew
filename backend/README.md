# PointBrew Backend API

Backend API para el sistema PointBrew desarrollado con Node.js, Express y SQL Server.

## Configuración de Base de Datos

### Prerequisitos
- SQL Server (Express/LocalDB/Full)
- Node.js v16+
- npm

### Configuración

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
Copia `.env.example` a `.env` y configura:
```env
DB_USER=sa
DB_PASSWORD=tu_password
DB_SERVER=localhost
DB_NAME=PointBrewDB
DB_ENCRYPT=false
DB_TRUST_CERT=true
PORT=3001
```

3. **Crear la base de datos:**
Ejecuta el script SQL en `database/schema.sql` en tu instancia de SQL Server.

4. **Iniciar el servidor:**
```bash
npm start
# o para desarrollo:
npm run dev
```

## Análisis del Esquema de Base de Datos

### ✅ Lógica del Esquema

El esquema presentado tiene una **lógica sólida** con las siguientes características:

#### Fortalezas:
1. **Separación clara de responsabilidades** - Catálogos separados de entidades principales
2. **Relaciones bien definidas** - Foreign keys apropiadas
3. **Estructura normalizada** - Evita redundancia de datos
4. **Flexibilidad** - Permite múltiples sucursales, tiendas y productos
5. **Auditoría** - Campos created_at/updated_at para trazabilidad

#### Estructura de Relaciones:
- **User ← Role** (Many-to-One)
- **Branch → Store** (One-to-Many)
- **Store → Product** (One-to-Many)
- **Product ← Category** (Many-to-One, opcional)
- **Ticket ← User, Store** (Many-to-One)
- **TicketProduct ← Ticket, Product** (Many-to-Many resolver)
- **Payment ← Ticket, PaymentMethod, PaymentStatus** (Many-to-One)
- **Turn ← Ticket, Branch, User, TurnStatus** (Many-to-One)

## API Endpoints

### Usuarios (`/api/users`)
- `GET /` - Obtener todos los usuarios
- `GET /:id` - Obtener usuario por ID
- `POST /` - Crear nuevo usuario
- `PUT /:id` - Actualizar usuario
- `DELETE /:id` - Eliminar usuario

### Sucursales (`/api/branches`)
- `GET /` - Obtener todas las sucursales
- `GET /:id` - Obtener sucursal por ID
- `GET /:id/stores` - Obtener tiendas de una sucursal
- `POST /` - Crear nueva sucursal
- `PUT /:id` - Actualizar sucursal
- `DELETE /:id` - Eliminar sucursal

### Tiendas (`/api/stores`)
- `GET /` - Obtener todas las tiendas
- `GET /:id` - Obtener tienda por ID
- `POST /` - Crear nueva tienda
- `PUT /:id` - Actualizar tienda
- `DELETE /:id` - Eliminar tienda

### Productos (`/api/products`)
- `GET /` - Obtener todos los productos
- `GET /:id` - Obtener producto por ID
- `GET /store/:storeId` - Obtener productos de una tienda
- `POST /` - Crear nuevo producto
- `PUT /:id` - Actualizar producto
- `DELETE /:id` - Eliminar producto

### Tickets (`/api/tickets`)
- `GET /` - Obtener todos los tickets
- `GET /:id` - Obtener ticket por ID (con detalles)
- `GET /user/:userId` - Obtener tickets de un usuario
- `POST /` - Crear nuevo ticket

### Turnos (`/api/turns`)
- `GET /` - Obtener todos los turnos
- `GET /:id` - Obtener turno por ID
- `GET /branch/:branchId` - Obtener turnos de una sucursal (hoy)
- `GET /user/:userId` - Obtener turnos de un usuario
- `POST /` - Crear nuevo turno
- `PUT /:id/status` - Actualizar estado del turno

### Catálogos (`/api/catalog`)
- `GET /roles` - Obtener todos los roles
- `GET /payment-methods` - Obtener métodos de pago
- `GET /payment-statuses` - Obtener estados de pago
- `GET /turn-statuses` - Obtener estados de turno
- `GET /categories` - Obtener categorías
- `POST /categories` - Crear nueva categoría

## Formato de Respuesta

Todas las respuestas siguen el formato:
```json
{
  "success": true|false,
  "message": "Mensaje descriptivo",
  "data": {...} // Solo en respuestas exitosas
}
```

## Estructura de Archivos

```
backend/
├── config/
│   └── database.js          # Configuración de conexión MSSQL
├── controllers/
│   ├── userController.js    # Lógica de usuarios
│   ├── branchController.js  # Lógica de sucursales
│   ├── storeController.js   # Lógica de tiendas
│   ├── productController.js # Lógica de productos
│   ├── ticketController.js  # Lógica de tickets
│   ├── turnController.js    # Lógica de turnos
│   └── catalogController.js # Lógica de catálogos
├── routes/
│   ├── users.js
│   ├── branches.js
│   ├── stores.js
│   ├── products.js
│   ├── tickets.js
│   ├── turns.js
│   └── catalog.js
├── database/
│   └── schema.sql           # Script de creación de BD
├── .env.example
├── app.js
└── package.json
```

## Características Técnicas

- **Pool de conexiones** para optimizar performance
- **Transacciones** en operaciones complejas (creación de tickets)
- **Manejo de errores** centralizado
- **Validaciones** de entrada
- **CORS** habilitado para frontend
- **SQL injection prevention** usando parámetros
- **Auto-incremento** de números de cola por sucursal
