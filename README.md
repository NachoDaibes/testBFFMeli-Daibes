# 🛒 Marketplace - Daibes

Challenge técnico de Mercado Libre resuelto por **Juan Ignacio Daibes**.

## Breve explicación

Con este código presento la solución que desarrollé para el challenge técnico propuesto. Para resolverlo utilicé nestjs (que es un framework de nodejs), typescript, swagger y para los test utilicé jest junto con la librería de testing que proporciona nestjs.

## Aclaración importante sobre el acceso a la base de datos

Para ciertas funcionalidades de este proyecto, creé un servidor en Google Cloud y dentro de él una base de datos, y el acceso se configuró para permitir conexiones desde un amplio rango de direcciones IP.

En caso de que encuentre dificultades al desplegar el proyecto, es posible que la dirección IP del evaluador no esté dentro de los rangos autorizados.

Los rangos de IP actualmente habilitados son los siguientes:
  - 191.0.0.0/8
  - 190.0.0.0/8
  - 200.0.0.0/7
  - 181.0.0.0/8

### Autenticación

#### Autenticación por "x-auth-token"

La autenticación se realiza mediante el envío de un header "x-auth-token". Dependiendo del token que se envíe, el sistema responde de la siguiente manera:

- Token válido: permite acceder al circuito completo.
- Token alternativo: devuelve una respuesta mockeada.
- Token inválido: devuelve un error 401 Unauthorized.


#### Otra rama con autenticación alternativa
En la rama feature/solucionConLogin está la misma solución pero con un método de autenticación distinto. En este caso, armé un pequeño modelo que incluye las entidades User, Role, Session y UserRole, con tres endpoints ubicados en src/auth/auth.controller.ts.

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

## Instalación y ejecución

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Levantar el proyecto:
  ```bash
   npm run start
   ```

## Documentación en Swagger

  Disponible en:
  http://localhost:3000/api-docs

## Endpoints disponibles

- (GET) marketplace/getProductsByQuery

    - Curl de ejemplo: 

curl --location 'http://localhost:3000/marketplace/getProductsByQuery?q=apple&sortBy=rating&offset=1&limit=4&order=asc' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgsInVzZXJSb2xlcyI6WyJVc3VhcmlvIFJlZ3VsYXIiLCJBZG1pbmlzdHJhZG9yIl0sImlhdCI6MTc1MjY3MTI5NiwiZXhwIjoxNzUyNjg5Mjk2fQ.jw1jlmjlSjHyupwowUVMytO2gqKJDscz87Issy_zt88' \
--header 'site: MLA'

- (GET) martketplace/getProductsByCategory

    - Curl de ejemplo: 

curl --location 'http://localhost:3000/marketplace/getAllByCategory/womens-watches?sortBy=rating&limit=3&offset=1&order=desc' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgsInVzZXJSb2xlcyI6WyJVc3VhcmlvIFJlZ3VsYXIiLCJBZG1pbmlzdHJhZG9yIl0sImlhdCI6MTc1MjY3MTI5NiwiZXhwIjoxNzUyNjg5Mjk2fQ.jw1jlmjlSjHyupwowUVMytO2gqKJDscz87Issy_zt88'

- (DELETE) marketplace/deleteProductsByCategory

    - Curl de ejemplo: 

curl --location --request DELETE 'http://localhost:3000/marketplace/deleteAllByCategory/womens-watches' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjgsInVzZXJSb2xlcyI6WyJVc3VhcmlvIFJlZ3VsYXIiLCJBZG1pbmlzdHJhZG9yIl0sImlhdCI6MTc1MjY3MTI5NiwiZXhwIjoxNzUyNjg5Mjk2fQ.jw1jlmjlSjHyupwowUVMytO2gqKJDscz87Issy_zt88'

## Variables de entorno

- (Credenciales para la conexion a la DB con un usuario con permisos limitados)
    - DB_HOST=35.239.114.233
    - DB_PORT=3306
    - DB_USER=onlyRead
    - DB_PASSWORD=OnlyRead11
    - DB_NAME=testMeliDev

- (Llave para JWT)
    - JWT_SECRET_KEY=CLAVE-DAIBES11

- (Urls de los servicios externos)
    - PRODUCTS_BASE_URL=https://dummyjson.com/products
    - FREE_SHIPPING_URL=https://www.mockachino.com/301a2290-f16a-44//free_shipping

- (Token Valido y token mock)
    - VALID_TOKEN=e962f81a-4d42-4eb3-86cd-a25e7237c8dc
    - MOCK_TOKEN=55a4639f-55e8-4e14-a6cc-b79977b20a4e

## Tracker
Hice un pequeño tracker para registrar los movimientos realizados sobre los 3 endpoints  mencionados anteriormente.

### Endpoints disponibles

- GET tracker/getTrackingByOperation
    - Curl de ejemplo:     
curl -X 'GET' \
  'http://localhost:3000/tracker/getTrackingByOperation?operation=getProductsByQuery' \
  -H 'accept: */*'

- GET tracker/getTrackingByToken
    - Curl de ejemplo: 

curl -X 'GET' \
  'http://localhost:3000/tracker/getTrackingByToken?token=e962f81a-4d42-4eb3-86cd-a25e7237c8' \
  -H 'accept: */*'

## Test

### Ejecución de los test
   ```bash
   npm run test
   ```

## Estructura de ramas en GitHub

  - feature/*: ramas de funcionalidades
  - develop: rama de desarrollo principal
  - relase/*: ramas de QA o PRE Produccion
  - master: rama principal o Produccion