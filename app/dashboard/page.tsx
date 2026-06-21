"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { resolveDashboardPath } from "@/lib/auth/dashboard";
import { getAuthSession } from "@/lib/auth/session";

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const auth = getAuthSession();
    if (!auth) {
      router.replace("/login");
      return;
    }
    router.replace(resolveDashboardPath(auth.user));
  }, [router]);

  return (
    <div className="flex min-h-full flex-1 items-center justify-center text-sm text-zinc-500">
      Redirection vers votre dashboard…
    </div>
  );
}
