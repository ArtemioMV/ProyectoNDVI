import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import type { PropsWithChildren } from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { hydrateCompanySettings } from "@/services/settings/company-settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

function DisableNumberInputWheel() {
  useEffect(() => {
    function handleWheel(event: WheelEvent) {
      const target = event.target;

      if (!(target instanceof HTMLInputElement) || target.type !== "number") {
        return;
      }

      if (document.activeElement === target) {
        target.blur();
      }
    }

    document.addEventListener("wheel", handleWheel, { capture: true });

    return () => {
      document.removeEventListener("wheel", handleWheel, { capture: true });
    };
  }, []);

  return null;
}

export function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => {
    void hydrateCompanySettings();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <DisableNumberInputWheel />
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}


