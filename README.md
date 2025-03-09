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
  - Casos de uso específicos (OpenLock, CloseLock, UpdateLockStatus)
  - Servicios de aplicación que implementan los puertos de entrada y orquestan los casos de uso
  - DTOs para transferencia de datos entre capas

- **Infraestructura**:
  - Adaptadores de entrada (implementaciones de los puertos de entrada, como WebSockets)
  - Adaptadores de salida (implementaciones de los puertos de salida, como Redis y MQTT)
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
- Node.js v18+
- pnpm v8+

## Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/yourusername/smart-lock-access-control.git
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

```
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

```
src/
├── domain/                 # Lógica de negocio y reglas
│   ├── entities/           # Entidades de dominio (Lock)
│   ├── ports/              # Puertos para comunicación externa
│   │   ├── input/          # Puertos de entrada (primarios)
│   │   └── output/         # Puertos de salida (secundarios)
│   └── services/           # Servicios de dominio (LockDomainService)
├── application/            # Casos de uso que orquestan el dominio
│   ├── dtos/               # Data Transfer Objects
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