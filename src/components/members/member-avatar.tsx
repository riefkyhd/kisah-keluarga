import Image from "next/image";
import { getAvatarFallbackStyle } from "@/lib/people";

type MemberAvatarProps = {
  fullName: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  testId?: string;
  coloredFallback?: boolean;
};

function getInitials(fullName: string) {
  const words = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "?";
  }

  const first = words[0]?.[0] ?? "";
  const second = words.length > 1 ? words[words.length - 1]?.[0] ?? "" : "";
  return (first + second).toUpperCase();
}

function getSizeClasses(size: "sm" | "md" | "lg") {
  if (size === "sm") {
    return "h-14 w-14 text-sm";
  }
  if (size === "lg") {
    return "h-28 w-28 text-2xl";
  }

  return "h-20 w-20 text-lg";
}

function getRequestedImageSize(size: "sm" | "md" | "lg") {
  if (size === "sm") {
    return {
      width: 128,
      height: 128,
      sizes: "64px"
    };
  }

  if (size === "lg") {
    return {
      width: 400,
      height: 400,
      sizes: "112px"
    };
  }

  return {
    width: 192,
    height: 192,
    sizes: "80px"
  };
}

function getRadiusClasses(size: "sm" | "md" | "lg") {
  if (size === "lg") {
    return "rounded-[var(--kk-radius-xl)]";
  }

  return "rounded-full";
}

export function MemberAvatar({
  fullName,
  photoUrl,
  size = "md",
  testId,
  coloredFallback = false
}: MemberAvatarProps) {
  const sizeClasses = getSizeClasses(size);
  const requestSize = getRequestedImageSize(size);
  const radiusClasses = getRadiusClasses(size);
  const initials = getInitials(fullName);
  const imageAlt = `Foto profil ${fullName}`;

  if (photoUrl) {
    return (
      <div
        data-testid={testId}
        className={`overflow-hidden border border-[color:rgba(212,184,150,0.4)] ${sizeClasses} ${radiusClasses}`}
      >
        <Image
          src={photoUrl}
          alt={imageAlt}
          width={requestSize.width}
          height={requestSize.height}
          sizes={requestSize.sizes}
          className={`h-full w-full object-cover ${radiusClasses}`}
        />
      </div>
    );
  }

  return (
    <div
      data-testid={testId}
      className={`flex items-center justify-center border font-medium ${sizeClasses} ${radiusClasses}`}
      style={
        coloredFallback
          ? getAvatarFallbackStyle(fullName)
          : {
              borderColor: "rgba(212,184,150,0.4)",
              backgroundColor: "#f7f3ed",
              color: "#796759"
            }
      }
      aria-label={imageAlt}
    >
      {initials}
    </div>
  );
}
