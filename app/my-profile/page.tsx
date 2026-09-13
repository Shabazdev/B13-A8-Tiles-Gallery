import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import ProfileView from "@/components/ProfileView";
import { User } from "@/lib/types";

// Force dynamic rendering — requires database connection
export const dynamic = "force-dynamic";

/**
 * Protected route — session is verified SERVER-SIDE.
 * Unauthenticated visitors are redirected to /login before any render.
 */
export default async function MyProfilePage() {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login?from=/my-profile");
  }

  const { user } = session;

  const currentUser: User = {
    id: user.id,
    name: user.name,
    email: user.email,
    photoUrl: user.image ?? "",
    isGoogleUser: false,
  };

  return <ProfileView currentUser={currentUser} />;
}
