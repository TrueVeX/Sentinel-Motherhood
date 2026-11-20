import { requireUser } from "@/lib/auth";
import { ProfileForm } from "../AccountForms";
import PageHead from "../PageHead";

const ROLE_NAMES = { mother: "Mother / family", professional: "Healthcare professional", admin: "Admin" };

export default async function ProfilePage() {
  const user = await requireUser();
  return (
    <>
      <PageHead eyebrow="PROFILE" title={<>Your <em>profile</em></>} text={`Account type: ${ROLE_NAMES[user.role]}`} />
      <div className="section-wrap page-body narrow">
        <ProfileForm
          name={user.name}
          email={user.email}
          role={user.role}
          journey={user.journey ?? "pregnancy"}
          dueDate={user.dueDate ?? ""}
          babyBirthDate={user.babyBirthDate ?? ""}
        />
      </div>
    </>
  );
}
