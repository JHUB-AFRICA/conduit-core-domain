"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/ingestion");
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center border-t border-line bg-bg">
      <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-accent" />
    </div>
  );
}
