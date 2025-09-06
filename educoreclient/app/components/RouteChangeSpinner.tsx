"use client";


import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Loader } from "@/app/components/ui/Loader";

export function RouteChangeSpinner() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      setLoading(true);
      const timeout = setTimeout(() => {
        setLoading(false);
        prevPath.current = pathname;
      }, 500); // Show spinner for at least 500ms
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line
  }, [pathname]);

  if (!loading) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60">
      <Loader size="xl" variant="spinner" text="Loading..." />
    </div>
  );
}
