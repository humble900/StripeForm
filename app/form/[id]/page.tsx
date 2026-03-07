"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function FormRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params?.id as string;

  useEffect(() => {
    if (formId) {
      // Redirect to the correct forms route
      router.replace(`/forms/${formId}`);
    }
  }, [formId, router]);

  return <LoadingSpinner size="lg" centered text="Redirecting to form..." />;
}
