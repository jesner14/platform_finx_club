import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { documentContentUrl } from "./api";
import type { InvestorDocument } from "./types";

type Props = {
  applicationId: string;
  photo: InvestorDocument | undefined;
  className?: string;
};

export function IdentityPhoto({ applicationId, photo, className }: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    (async () => {
      setSrc(null);
      setError(null);
      if (!photo) {
        setError("Photo de l’étape 1 introuvable");
        return;
      }
      const type = (photo.contentType || "").toLowerCase();
      if (type && !type.startsWith("image/")) {
        setError("La pièce jointe n’est pas une image. Joignez un JPG ou PNG à l’étape 1.");
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(documentContentUrl(applicationId, photo.id));
        if (!response.ok) throw new Error("HTTP " + response.status);
        const blob = await response.blob();
        if (!blob.type.startsWith("image/") && blob.size > 0) {
          // Some proxies omit type; sniff via URL extension / assume ok if fetch succeeded
        }
        objectUrl = URL.createObjectURL(blob);
        if (cancelled) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        setSrc(objectUrl);
      } catch {
        if (!cancelled) setError("Impossible de charger la photo d’identité.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [applicationId, photo?.id, photo?.contentType, photo?.sizeBytes]);

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-[#0B1B59]/10 bg-[#F4F6FA] ${className ?? "w-full aspect-[3/4] max-h-56"}`}
      >
        <Loader2 className="animate-spin text-[#0B1B59]/40" size={22} />
      </div>
    );
  }

  if (error || !src) {
    return (
      <div
        className={`flex items-center justify-center text-center px-3 text-[13px] text-[#0B1B59]/45 rounded-xl border border-dashed border-[#0B1B59]/20 bg-[#F4F6FA] ${className ?? "w-full aspect-[3/4] max-h-56"}`}
      >
        {error ?? "Photo indisponible"}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="Photo d’identité"
      className={`object-cover rounded-xl border border-[#0B1B59]/10 bg-[#F4F6FA] ${className ?? "w-full aspect-[3/4] max-h-56"}`}
      onError={() => {
        setError("Impossible d’afficher la photo d’identité.");
        setSrc(null);
      }}
    />
  );
}
