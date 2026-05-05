import { Global, Module } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';
import { CloudinaryService } from './cloudinary.service';

/**
 * Module global : `CloudinaryService` est injectable partout dans l'app
 * sans avoir à réimporter le module dans chaque feature.
 */
@Global()
@Module({
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
