import * as dns from 'dns';
// Utiliser Google DNS pour résoudre les enregistrements SRV (bloqués par certains FAI)
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

import { mkdirSync } from 'fs';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  app.useWebSocketAdapter(new IoAdapter(app));
  const mediaDir = join(process.cwd(), 'uploads', 'chat');
  mkdirSync(mediaDir, { recursive: true });
  mkdirSync(join(process.cwd(), 'uploads', 'lab-analysis'), { recursive: true });
  mkdirSync(join(process.cwd(), 'uploads', 'brain-mri'), { recursive: true });
  app.useStaticAssets(mediaDir, { prefix: '/api/chat/media/' });
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  app.enableCors({
    origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
  });
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  // Créer/mettre à jour l'admin par défaut (après connexion DB)
  setTimeout(async () => {
    try {
      const authService = app.get(AuthService);
      await authService.createAdmin('25k01a2003c@gmail.com', 'Admin123!', 'Admin MediFollow');
      console.log('Admin prêt: 25k01a2003c@gmail.com / Admin123!');
      await authService.createSuperAdmin('khalilhlila2@gmail.com', 'SuperAdmin123!', 'Super Admin MediFollow');
      console.log('Super Admin prêt: khalilhlila2@gmail.com / SuperAdmin123!');
    } catch (e) {
      // Ignorer si erreur
    }
  }, 2000);
  console.log(`MediFollow API running on port ${port}`);
}
bootstrap();
