import { getCurrentUser } from "@/lib/auth";
import { ContactForm } from "../AccountForms";
import PageHead from "../PageHead";

export default async function ContactPage() {
  const user = await getCurrentUser();
  return (
    <>
      <PageHead eyebrow="CONTACT US" title={<>We’d love to <em>hear from you.</em></>} text="Questions, ideas or feedback about Sentinel? Send us a message." />
      <div className="section-wrap page-body narrow">
        <ContactForm name={user?.name ?? ""} email={user?.email ?? ""} />
        <p className="block-note">For medical questions or emergencies, please contact a healthcare professional or your local emergency number.</p>
      </div>
    </>
  );
}
