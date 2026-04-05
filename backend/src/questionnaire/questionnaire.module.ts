import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionnaireTemplate, QuestionnaireTemplateSchema } from './schemas/questionnaire-template.schema';
import { ProtocolTemplate, ProtocolTemplateSchema } from './schemas/protocol-template.schema';
import {
  PatientProtocolAssignment,
  PatientProtocolAssignmentSchema,
} from './schemas/patient-protocol-assignment.schema';
import { QuestionnaireAddon, QuestionnaireAddonSchema } from './schemas/questionnaire-addon.schema';
import { QuestionnaireSubmission, QuestionnaireSubmissionSchema } from './schemas/questionnaire-submission.schema';
import { Patient, PatientSchema } from '../patient/schemas/patient.schema';
import { QuestionnaireService } from './questionnaire.service';
import { QuestionnaireController } from './questionnaire.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QuestionnaireTemplate.name, schema: QuestionnaireTemplateSchema },
      { name: ProtocolTemplate.name, schema: ProtocolTemplateSchema },
      { name: PatientProtocolAssignment.name, schema: PatientProtocolAssignmentSchema },
      { name: QuestionnaireAddon.name, schema: QuestionnaireAddonSchema },
      { name: QuestionnaireSubmission.name, schema: QuestionnaireSubmissionSchema },
      { name: Patient.name, schema: PatientSchema },
    ]),
  ],
  controllers: [QuestionnaireController],
  providers: [QuestionnaireService],
  exports: [QuestionnaireService],
})
export class QuestionnaireModule {}
