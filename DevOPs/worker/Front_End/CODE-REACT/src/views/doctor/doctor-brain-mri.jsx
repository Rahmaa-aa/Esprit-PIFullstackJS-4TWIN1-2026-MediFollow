import React from "react";
import { useSearchParams } from "react-router-dom";
import BrainMriAnalysisPage from "../../components/brain-mri-analysis-page";
import { normalizeMongoId } from "../../utils/mongoId";

const DoctorBrainMri = () => {
  const [searchParams] = useSearchParams();
  const raw = searchParams.get("patientId");
  const patientId = normalizeMongoId(raw) || undefined;
  return <BrainMriAnalysisPage variant="doctor" patientId={patientId} />;
};

export default DoctorBrainMri;
