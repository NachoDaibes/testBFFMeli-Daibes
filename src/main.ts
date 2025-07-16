import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors()
  //Configuracion del swagger
  const config = new DocumentBuilder()
    .setTitle('Marketplace API - Daibes')
    .setDescription('Documentación de la API de Marketplace')
    .setVersion('1.0')
    .addTag('marketplace')
    .addBearerAuth({ type: 'http', scheme: 'bearer', name: 'Authorization', in: 'header' }, 'Authorization')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
}
bootstrap();
