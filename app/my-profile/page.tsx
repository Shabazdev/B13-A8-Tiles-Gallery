import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import ProfileView from "@/components/ProfileView";
import { User } from "@/lib/types";

/**
 * Protected route — session is verified SERVER-SIDE.
 * Unauthenticated visitors are redirected to /login before any render.
 */
export default async function MyProfilePage() {
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
