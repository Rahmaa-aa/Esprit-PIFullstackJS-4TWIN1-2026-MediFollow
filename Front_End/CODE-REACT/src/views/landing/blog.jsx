import LandingShell from "../../components/landing/LandingShell";
import GlobalHealthcareNews from "../news/global-healthcare-news";

/**
 * Fil d’actualité santé (ex-/global-news), réservé au site public (landing).
 */
export default function Blog() {
  return (
    <LandingShell navActive="blog">
      <GlobalHealthcareNews />
    </LandingShell>
  );
}
