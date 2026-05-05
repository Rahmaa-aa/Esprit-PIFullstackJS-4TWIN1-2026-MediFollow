import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export type DepartmentCatalogDocument = HydratedDocument<DepartmentCatalog>;

/** Départements enregistrés par le super admin (liste partagée avec les formulaires). */
@Schema({ collection: 'department_catalog', timestamps: true })
export class DepartmentCatalog {
  @Prop({ required: true, trim: true })
  name: string;

  /** Administrateur hospitalier rattaché à ce département (User role admin), un par département. */
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  assignedAdminId?: MongooseSchema.Types.ObjectId;
}

export const DepartmentCatalogSchema = SchemaFactory.createForClass(DepartmentCatalog);
DepartmentCatalogSchema.index({ name: 1 }, { unique: true });
