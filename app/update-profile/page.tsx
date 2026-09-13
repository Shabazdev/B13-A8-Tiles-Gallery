import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import UpdateProfileView from "@/components/UpdateProfileView";

/**
 * Protected route — session is verified SERVER-SIDE.
 * The client component reads live session data from AuthContext so profile
 * updates reflect instantly across the UI.
 */
export default async function UpdateProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login?from=/update-profile");
  }

  return <UpdateProfileView />;
}
