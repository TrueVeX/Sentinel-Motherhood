import { requireUser } from "@/lib/auth";
import { OnboardingForm } from "../AuthForms";
import PageHead from "../PageHead";

export default async function OnboardingPage({ searchParams }: { searchParams: Promise<{ journey?: string }> }) {
  const user = await requireUser();
  const { journey } = await searchParams;

  return (
    <>
      <PageHead
        eyebrow={user.onboarded ? "UPDATE YOUR JOURNEY" : "LET’S GET YOU SET UP"}
        title={<>Hi {user.name.split(" ")[0]}, <em>where are you on your journey?</em></>}
        text="We’ll use this to take you to the most helpful dashboard."
      />
      <div className="section-wrap page-body narrow">
        <OnboardingForm
          name={user.name}
          role={user.role}
          journey={(typeof journey === "string" && journey) || user.journey || ""}
          dueDate={user.dueDate ?? ""}
          babyBirthDate={user.babyBirthDate ?? ""}
        />
      </div>
    </>
  );
}
