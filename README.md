# Sistema de Control de Acceso para Cerraduras Inteligentes

Este proyecto implementa un backend para un sistema de control de acceso que permite la gestión de cerraduras inteligentes a través de WebSockets y MQTT. El sistema está diseñado siguiendo los principios de la arquitectura hexagonal (también conocida como Ports and Adapters) para facilitar el mantenimiento, las pruebas y la evolución del sistema.

## Tabla de Contenidos

- [Sistema de Control de Acceso para Cerraduras Inteligentes](#sistema-de-control-de-acceso-para-cerraduras-inteligentes)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [Características](#características)
  - [Arquitectura](#arquitectura)
    - [Componentes Principales](#componentes-principales)
    - [Puertos y Adaptadores](#puertos-y-adaptadores)
    - [Flujo de Datos](#flujo-de-datos)
  - [Patrones de Implementación](#patrones-de-implementación)
    - [Inyección de Dependencias en Arquitectura Hexagonal](#inyección-de-dependencias-en-arquitectura-hexagonal)
    - [Clases Abstractas vs Interfaces](#clases-abstractas-vs-interfaces)
    - [Gestión de Dependencias Circulares](#gestión-de-dependencias-circulares)
  - [Tecnologías Utilizadas](#tecnologías-utilizadas)
  - [Prerrequisitos](#prerrequisitos)
  - [Configuración](#configuración)
    - [1. Clonar el repositorio](#1-clonar-el-repositorio)
    - [2. Configurar las variables de entorno](#2-configurar-las-variables-de-entorno)
    - [3. Configurar Mosquitto (MQTT)](#3-configurar-mosquitto-mqtt)
  - [Ejecución](#ejecución)
    - [Usando Docker Compose (recomendado)](#usando-docker-compose-recomendado)
    - [Desarrollo Local (sin Docker)](#desarrollo-local-sin-docker)
  - [Uso del Sistema](#uso-del-sistema)
    - [Conectarse mediante WebSockets](#conectarse-mediante-websockets)
    - [Simulación de Dispositivos MQTT](#simulación-de-dispositivos-mqtt)
  - [Estructura del Proyecto](#estructura-del-proyecto)
  - [Resolución de Problemas Comunes](#resolución-de-problemas-comunes)
    - [Problemas de Dependencias Circulares](#problemas-de-dependencias-circulares)
    - [Problemas con la Resolución de NestJS](#problemas-con-la-resolución-de-nestjs)
    - [Problemas con Redis o MQTT](#problemas-con-redis-o-mqtt)
    - [Problemas con Docker](#problemas-con-docker)
  - [Desarrollo y Contribución](#desarrollo-y-contribución)
    - [Ejecutar pruebas](#ejecutar-pruebas)
    - [Lint y formateo de código](#lint-y-formateo-de-código)

## Características

- ✅ Autenticación JWT para la comunicación segura con clientes
- ✅ Comunicación en tiempo real mediante WebSockets para la interfaz de usuario
- ✅ Integración con MQTT para comunicarse con dispositivos IoT (cerraduras)
- ✅ Redis como almacenamiento en memoria para estados de cerraduras y sesiones
- ✅ Arquitectura hexagonal para una clara separación de responsabilidades
- ✅ Dockerizado para facilitar el desarrollo y despliegue

## Arquitectura

El sistema está diseñado siguiendo la arquitectura hexagonal (también conocida como Ports and Adapters), que separa la lógica de negocio (dominio) de la infraestructura técnica. Esta separación permite:

- Independencia del framework: El dominio no depende de NestJS, Redis, MQTT o WebSockets
- Mayor testabilidad: Se puede probar cada capa de forma aislada
- Facilidad de mantenimiento: Las responsabilidades están claramente separadas
- Flexibilidad: Se pueden reemplazar componentes técnicos sin alterar la lógica de negocio

### Componentes Principales

- **Dominio**:
  - Entidades de negocio y reglas (Lock)
  - Puertos de entrada (interfaces que definen cómo se puede usar el dominio)
  - Puertos de salida (interfaces que definen cómo el dominio se comunica con servicios externos)
  - Servicios de dominio (lógica de negocio pura)

- **Aplicación**:
  - Casos de uso específicos (OpenLock, CloseLockUseCase, UpdateLockStatusUseCase)
  - Servicios de aplicación que implementan los puertos de entrada y orquestan los casos de uso
  - DTOs para transferencia de datos entre capas
  - Proxies para resolver dependencias circulares

- **Infraestructura**:
  - Adaptadores de entrada (implementaciones de los puertos de entrada, como WebSocketsAdapter)
  - Adaptadores de salida (implementaciones de los puertos de salida, como RedisRepository y MqttAdapter)
  - Configuración técnica, autenticación y aspectos transversales

### Puertos y Adaptadores

- **Puertos de Entrada (Primarios)**:
  - `LockCommandPort`: Define comandos para controlar cerraduras
  - `LockQueryPort`: Define consultas sobre el estado de cerraduras

- **Puertos de Salida (Secundarios)**:
  - `LockRepositoryPort`: Para persistencia de datos
  - `LockNotificationPort`: Para notificar cambios de estado
  - `LockControlPort`: Para comunicarse con dispositivos físicos
  - `SessionRepositoryPort`: Para gestionar sesiones

- **Adaptadores de Entrada**:
  - `WebsocketsAdapter`: Recibe comandos desde clientes web/móvil

- **Adaptadores de Salida**:
  - `RedisRepository`: Implementa persistencia en Redis
  - `MqttAdapter`: Implementa comunicación con dispositivos MQTT

### Flujo de Datos

1. Los clientes se conectan al backend a través de WebSockets
2. El backend verifica la autenticación mediante JWT
3. Los clientes envían comandos para abrir/cerrar cerraduras
4. El backend verifica permisos y envía el comando a la cerradura a través de MQTT
5. La cerradura ejecuta el comando y publica su nuevo estado en MQTT
6. El backend recibe el estado actualizado y notifica a todos los clientes conectados

## Patrones de Implementación

### Inyección de Dependencias en Arquitectura Hexagonal

La implementación utiliza varios patrones para manejar la inyección de dependencias en NestJS:

1. Tokens de String: Para facilitar la inyección de dependencias y evitar problemas con tipos TypeScript, utilizamos tokens de string:

   ```typescript
   @Inject('LOCK_DOMAIN_SERVICE')
   private readonly lockDomainService: LockDomainService
   ```

2. Proxy Pattern: Para resolver dependencias circulares, implementamos proxies que actúan como sustitutos temporales:

   ```typescript
   @Injectable()
   export class LockNotificationProxy implements LockNotificationPort {

     async notifyStatusChange(lockId: number, status: LockStatusType): Promise<void> {
       console.log(`[PROXY] Status change notification: Lock ${lockId} - ${status}`);
     }
   }
   ```

3. Forward References: Para manejar dependencias circulares entre módulos:

   ```typescript
   imports: [
     forwardRef(() => ApplicationModule),
   ]
   ```

### Clases Abstractas vs Interfaces

En esta implementación, los puertos (interfaces del dominio) están definidos como clases abstractas en lugar de interfaces tradicionales de TypeScript, lo que permite:

1. Usar los puertos como tokens de inyección en NestJS

2. Proporcionar implementaciones predeterminadas o parciales cuando sea necesario

3. Mantener la claridad de la arquitectura hexagonal

### Gestión de Dependencias Circulares

Para gestionar las dependencias circulares inherentes a la arquitectura hexagonal con NestJS:

1. Usamos proxy patterns para romper círculos de dependencia

2. Implementamos una estrategia de "lazy loading" con forward references

3. Priorizamos la inyección por token string sobre la inyección por tipo# Sistema de Control de Acceso para Cerraduras Inteligentes

## Tecnologías Utilizadas

- **Backend**: NestJS v10 (Node.js v22)
- **Comunicación en tiempo real**: Socket.io (WebSockets)
- **Comunicación IoT**: MQTT (Mosquitto)
- **Almacenamiento en memoria**: Redis
- **Autenticación**: JWT (JSON Web Tokens)
- **Contenedores**: Docker y Docker Compose
- **Lenguaje**: TypeScript
- **Gestor de paquetes**: pnpm

## Prerrequisitos

- Docker y Docker Compose
- Node.js v18+ (solo para desarrollo local)
- pnpm v8+ (solo para desarrollo local)

## Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/gabrielfagundeznievas/smart-lock-access-control.git
cd smart-lock-access-control
```

### 2. Configurar las variables de entorno

Crea un archivo `.env` en la raíz del proyecto o utiliza el proporcionado como referencia:

```env
# Configuración de la aplicación
PORT=3000
NODE_ENV=development

# Configuración de Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Configuración de MQTT
MQTT_HOST=mqtt
MQTT_PORT=1883
WEBSOCKET_PORT=9001

# Configuración de JWT
JWT_SECRET=your_secret_key_for_poc
JWT_EXPIRATION=1h
```

### 3. Configurar Mosquitto (MQTT)

Asegúrate de que existe un archivo `mosquitto.conf` en la raíz del proyecto:

```conf
# Configuración básica
listener 1883
allow_anonymous true

# Configuración para WebSockets
listener 9001
protocol websockets
allow_anonymous true

# Persistencia
persistence true
persistence_location /mosquitto/data/
log_dest file /mosquitto/log/mosquitto.log
```

## Ejecución

### Usando Docker Compose (recomendado)

1. Construir y levantar los contenedores:

   ```bash
   docker-compose up -d
   ```

2. Verificar que los contenedores estén funcionando:

   ```bash
   docker-compose ps
   ```

3. Ver los logs:

   ```bash
   docker-compose logs -f api
   ```

### Desarrollo Local (sin Docker)

1. Instalar dependencias:

   ```bash
   pnpm install
   ```

2. Asegúrate de tener Redis y un broker MQTT corriendo localmente o ajusta las variables de entorno para apuntar a instancias externas.

3. Iniciar la aplicación en modo desarrollo:

   ```bash
   pnpm start:dev
   ```

## Uso del Sistema

### Conectarse mediante WebSockets

Los clientes pueden conectarse mediante WebSockets incluyendo un token JWT en los headers:

```javascript
// Cliente JavaScript
const socket = io('http://localhost:3000', {
  extraHeaders: {
    Authorization: 'Bearer YOUR_JWT_TOKEN'
  }
});

// Escuchar cambios de estado
socket.on('lockStatusChange', (data) => {
  console.log(`Cerradura ${data.lockId} cambió a: ${data.status}`);
});

// Enviar comando para abrir una cerradura
socket.emit('openLock', { lockId: 1 }, (response) => {
  console.log('Respuesta:', response);
});

// Enviar comando para cerrar una cerradura
socket.emit('closeLock', { lockId: 1 }, (response) => {
  console.log('Respuesta:', response);
});
```

### Simulación de Dispositivos MQTT

Puedes simular una cerradura inteligente usando herramientas como MQTT Explorer o mosquitto_pub:

```bash
# Publicar un cambio de estado (simulando la cerradura)
mosquitto_pub -h localhost -t "lock/status" -m '{"lockId": 1, "status": "open"}'
```

Y para recibir comandos:

```bash
# Suscribirse al topic de comandos (desde el punto de vista de la cerradura)
mosquitto_sub -h localhost -t "lock/control"
```

## Estructura del Proyecto

```txt
src/
├── domain/                 # Lógica de negocio y reglas
│   ├── entities/           # Entidades de dominio (Lock)
│   ├── ports/              # Puertos para comunicación externa
│   │   ├── input/          # Puertos de entrada (primarios)
│   │   └── output/         # Puertos de salida (secundarios)
│   └── services/           # Servicios de dominio (LockDomainService)
├── application/            # Casos de uso que orquestan el dominio
│   ├── dtos/               # Data Transfer Objects
│   ├── proxy/              # Proxies para resolver dependencias circulares
│   ├── services/           # Servicios de aplicación (LockApplicationService)
│   └── use-cases/          # Implementación de casos de uso específicos
├── infrastructure/         # Implementaciones técnicas (adaptadores)
│   ├── adapters/
│   │   ├── input/          # Adaptadores de entrada (implementan puertos de entrada)
│   │   └── output/         # Adaptadores de salida (implementan puertos de salida)
│   ├── config/             # Configuración de la aplicación
│   └── auth/               # Autenticación JWT
├── app.module.ts           # Módulo principal de NestJS
└── main.ts                 # Punto de entrada
```

## Resolución de Problemas Comunes

### Problemas de Dependencias Circulares

Si encuentras errores como UnknownDependenciesException o CircularDependencyException:

1. Utiliza tokens string para inyección:

   ```typescript
   @Inject('TOKEN_NAME')
   private readonly service: ServiceType;
   ```

2. Utiliza forward references:

   ```typescript
   @Inject(forwardRef(() => Service))
   private readonly service: Service;
   ```

3. Implementa un proxy:
   Si una dependencia circular no se puede resolver con forwardRef, considera implementar un proxy que actúe como intermediario.

### Problemas con la Resolución de NestJS

1. Error: "solo hace referencia a un tipo, pero aquí se usa como valor":
   - Cambia de interfaces a clases abstractas para tus puertos
   - Utiliza useClass o useExisting en lugar de inyección directa

2. Error: "Nest can't resolve dependencies":
   - Asegúrate de que todos los módulos necesarios están importados
   - Verifica que los providers estén correctamente declarados
   - Considera hacer global el módulo con @Global()

### Problemas con Redis o MQTT

1. Error de conexión a Redis:
   - Verifica que Redis esté accesible en la URL configurada
   - Asegúrate de que las variables de entorno estén correctamente definidas

2. Error de conexión a MQTT:
   - Verifica la configuración del broker MQTT
   - Comprueba que el archivo mosquitto.conf está correctamente montado

### Problemas con Docker

1. Error de permisos:

   ```bash
   sudo chown -R $USER:$USER .
   ```

2. Problema con puertos ya utilizados:
   - Cambia los puertos en el archivo .env
   - O detén los servicios que estén usando esos puertos## Patrones de Implementación

## Desarrollo y Contribución

### Ejecutar pruebas

```bash
# Pruebas unitarias
pnpm test

# Pruebas e2e
pnpm test:e2e

# Cobertura de pruebas
pnpm test:cov
```

### Lint y formateo de código

```bash
# Ejecutar ESLint
pnpm lint

# Formatear código con Prettier
pnpm format
```
