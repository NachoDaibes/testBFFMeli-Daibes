# 🛒 Marketplace - Daibes

Challenge técnico de Mercado Libre resuelto por **Juan Ignacio Daibes**.

## 🧰 Tecnologías utilizadas

- **NestJS** v9.4.2
- **Node.js** v22.17.0
- **TypeORM** + **MySQL**
- **Swagger** (documentación)
- **Axios** (para llamadas HTTP)

## 🚀 Instalación y ejecución

1. Instalar dependencias:
   ```bash
   npm install

2. Levantar el proyecto:
  ```bash
   npm run start

## Documentación en Swagger

  Disponible en:
  http://localhost:3000/api-docs

## 🚀 Endpoints disponibles

- (GET) marketplace/getProductsByQuery

  Curl de ejemplo: 


- (GET) martketplace/getProductsByCategory

  Curl de ejemplo: 

- (DELETE) marketplace/deleteProductsByCategory

  Curl de ejemplo: 

## Autenticación

Se valida el header "x-auth-token". En caso de ser un token válido, se permitirá el acceso al método, en caso de ser un 
token alternativo se retornará un ejemplo mockeado y en caso de ser un token inválido se retornará 401 Unauthorized.

## Variables de entorno

- (Credenciales para la conexion a la DB con un usuario con permisos limitados)
    DB_HOST=35.239.114.233
    DB_PORT=3306
    DB_USER=onlyRead
    DB_PASSWORD=OnlyRead11
    DB_NAME=testMeliDev

- (Llave para JWT)
    JWT_SECRET_KEY=CLAVE-DAIBES11

- (Urls de los servicios externos)
    PRODUCTS_BASE_URL=https://dummyjson.com/products
    FREE_SHIPPING_URL=https://www.mockachino.com/301a2290-f16a-44//free_shipping

- (Token Valido y token mock)
    VALID_TOKEN=e962f81a-4d42-4eb3-86cd-a25e7237c8dc
    MOCK_TOKEN=55a4639f-55e8-4e14-a6cc-b79977b20a4e

## Estructura de ramas en GitHub

  - feature/*: ramas de funcionalidades
  - develop: rama de desarrollo principal
  - relase/*: ramas de QA o PRE Produccion
  - master: rama principal o Produccion