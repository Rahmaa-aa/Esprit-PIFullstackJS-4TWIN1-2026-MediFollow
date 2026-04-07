import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Attache `req.user` si un Bearer JWT valide est présent ; sinon laisse `user` indéfini (pas d’erreur 401).
 * Utile pour filtrer les listes (ex. médecins) selon le rôle sans imposer l’authentification.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      await super.canActivate(context);
    } catch {
      /* pas de jeton ou invalide */
    }
    return true;
  }

  override handleRequest<TUser = unknown>(err: unknown, user: TUser): TUser {
    return user;
  }
}
