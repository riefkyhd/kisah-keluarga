"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

function isStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

  const displayModeStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone = "standalone" in window.navigator && Boolean((window.navigator as { standalone?: boolean }).standalone);

  return displayModeStandalone || iosStandalone;
}

export function InstallAppPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    setIsInstalled(isStandaloneMode());

    const handleBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      promptEvent.preventDefault();
      setInstallEvent(promptEvent);
    };

    const handleAppInstalled = () => {
      setInstallEvent(null);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const showPrompt = installEvent && !isInstalled && !isDismissed;
  if (!showPrompt) {
    return null;
  }

  const handleInstall = async () => {
    if (!installEvent) {
      return;
    }

    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  return (
    <Card className="space-y-3 border-[color:var(--color-sand)] bg-[color:var(--color-warm)]/70">
      <div className="flex items-start gap-3">
        <div className="rounded-[var(--kk-radius-sm)] bg-[color:#f7efe4] p-2 text-[color:var(--color-clay)]">
          <Download className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base text-[color:var(--color-bark)]">Pasang aplikasi di layar utama</h3>
          <p className="text-sm font-normal leading-relaxed text-[color:var(--kk-muted)]">
            Supaya akses lebih cepat seperti aplikasi HP, Anda bisa menambahkan Kisah Keluarga ke home screen.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleInstall} className="min-w-36">
          Pasang Aplikasi
        </Button>
        <Button variant="outline" onClick={() => setIsDismissed(true)}>
          Nanti Saja
        </Button>
      </div>
    </Card>
  );
}
