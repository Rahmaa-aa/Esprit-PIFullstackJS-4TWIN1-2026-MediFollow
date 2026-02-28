import * as dns from 'dns';
// Utiliser Google DNS pour résoudre les enregistrements SRV (bloqués par certains FAI)
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
  });
  app.setGlobalPrefix('api');

  await app.listen(3000);

  // Créer/mettre à jour l'admin par défaut (après connexion DB)
  setTimeout(async () => {
    try {
      const authService = app.get(AuthService);
      await authService.createAdmin('admin@medifollow.com', 'Admin123!', 'Admin MediFollow');
      console.log('Admin prêt: admin@medifollow.com / Admin123!');
    } catch (e) {
      // Ignorer si erreur
    }
  }, 2000);
  console.log('MediFollow API running on http://localhost:3000');
}
bootstrap();
