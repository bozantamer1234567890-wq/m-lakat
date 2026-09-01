import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/actions";
import { NavbarClient } from "@/components/navbar-client";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <NavbarClient authed={!!user} onSignOut={signOut} />;
}
