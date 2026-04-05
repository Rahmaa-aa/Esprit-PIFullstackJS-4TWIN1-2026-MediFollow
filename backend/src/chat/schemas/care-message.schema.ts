import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class CareMessage extends Document {
  /** Fil patient (équipe soignante + patient) — exclusif avec peerThreadKey */
  @Prop({ type: Types.ObjectId, ref: 'Patient', required: false, index: true })
  patientId?: Types.ObjectId;

  /** Fil entre deux professionnels du même département — exclusif avec patientId */
  @Prop({ required: false, index: true })
  peerThreadKey?: string;

  /** Fil groupe staff (exclusif avec patientId ; peerThreadKey = group:<id>) */
  @Prop({ type: Types.ObjectId, ref: 'StaffGroup', required: false, index: true })
  groupId?: Types.ObjectId;

  @Prop({ required: true, enum: ['patient', 'doctor', 'nurse', 'carecoordinator'] })
  senderRole: 'patient' | 'doctor' | 'nurse' | 'carecoordinator';

  /** Identifiant du compte expéditeur (string pour comparaisons JWT) */
  @Prop({ required: true })
  senderId: string;

  /** Texte chiffré au repos si MESSAGE_ENCRYPTION_KEY est défini ; vide pour un vocal */
  @Prop({ required: false, maxlength: 40000, default: '' })
  body?: string;

  @Prop({
    enum: ['text', 'voice', 'image', 'video', 'document', 'call', 'vital_alert', 'escalation'],
    default: 'text',
  })
  kind: 'text' | 'voice' | 'image' | 'video' | 'document' | 'call' | 'vital_alert' | 'escalation';

  /** Lien vers le relevé de constantes (messages auto d’alerte / escalade) */
  @Prop({ type: Types.ObjectId, ref: 'HealthLog', required: false })
  healthLogId?: Types.ObjectId;

  /** Message vocal (peut être chiffré au repos) */
  @Prop({ required: false, maxlength: 8000 })
  audioUrl?: string;

  /** Photo / vidéo / document (peut être chiffré au repos) */
  @Prop({ required: false, maxlength: 8000 })
  mediaUrl?: string;

  @Prop({ required: false, maxlength: 500 })
  mimeType?: string;

  /** Nom de fichier d’origine (affichage / téléchargement) */
  @Prop({ required: false, maxlength: 1000 })
  fileName?: string;
}

export const CareMessageSchema = SchemaFactory.createForClass(CareMessage);
CareMessageSchema.index({ patientId: 1, createdAt: -1 }, { sparse: true });
CareMessageSchema.index({ peerThreadKey: 1, createdAt: -1 }, { sparse: true });
CareMessageSchema.index({ groupId: 1, createdAt: -1 }, { sparse: true });
CareMessageSchema.index({ healthLogId: 1, createdAt: -1 }, { sparse: true });
