# 🛒 Marketplace - Daibes

Challenge técnico de Mercado Libre resuelto por **Juan Ignacio Daibes**.

## Breve explicación

Con este código presento la solución que encontré para el challenge técnico que me enviaron. Para resolverlo utilicé nestjs (que es un framework de nodejs), typescript, swagger y para los test utilicé jest junto con la librería de testing que proporciona nestjs.

### Autenticación

#### Autenticación por "x-auth-token"

La autenticación se realiza mediante el envío de un header "x-auth-token". Dependiendo del token que se envíe, el sistema responde de la siguiente manera:

- Token válido: permite acceder al circuito completo.
- Token alternativo: devuelve una respuesta mockeada.
- Token inválido: devuelve un error 401 Unauthorized.


#### Otra rama con autenticación alternativa
En la rama feature/auth está la misma solución pero con un método de autenticación distinto. En este caso, armé un pequeño modelo que incluye las entidades User, Role, Session y UserRole, con tres endpoints ubicados en src/auth/auth.controller.ts.

Para usar esta autenticación:

1. Primero hay que registrarse mediante el endpoint Register.
2. Luego iniciar sesión con el endpoint Login.
3. A partir de ahí, en los endpoints protegidos se debe enviar un header authorization con el valor:
  "Bearer ${token devuelto por el login}".

## Tecnologías utilizadas

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

curl --location 'http://localhost:3000/marketplace/getProductsByQuery?q=apple&sortBy=rating&offset=1&limit=4&order=asc' \
--header 'x-auth-token: e962f81a-4d42-4eb3-86cd-a25e7237c8dc' \
--header 'site: MLA'

- (GET) martketplace/getProductsByCategory

  Curl de ejemplo: 

curl --location 'http://localhost:3000/marketplace/getAllByCategory/womens-watches?sortBy=rating&limit=3&offset=1&order=desc' \
--header 'x-auth-token: e962f81a-4d42-4eb3-86cd-a25e7237c8dc'

- (DELETE) marketplace/deleteProductsByCategory

  Curl de ejemplo: 

curl --location --request DELETE 'http://localhost:3000/marketplace/deleteAllByCategory/womens-watches' \
--header 'x-auth-token: e962f81a-4d42-4eb3-86cd-a25e7237c8dc'

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