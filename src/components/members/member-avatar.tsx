import Image from "next/image";

type MemberAvatarProps = {
  fullName: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  testId?: string;
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

function getRadiusClasses(size: "sm" | "md" | "lg") {
  if (size === "lg") {
    return "rounded-[2rem]";
  }

  return "rounded-full";
}

export function MemberAvatar({ fullName, photoUrl, size = "md", testId }: MemberAvatarProps) {
  const sizeClasses = getSizeClasses(size);
  const radiusClasses = getRadiusClasses(size);
  const initials = getInitials(fullName);
  const imageAlt = `Foto profil ${fullName}`;

  if (photoUrl) {
    return (
      <div data-testid={testId} className={`relative overflow-hidden border border-stone-200 ${sizeClasses} ${radiusClasses}`}>
        <Image src={photoUrl} alt={imageAlt} fill sizes="112px" className="object-cover" />
      </div>
    );
  }

  return (
    <div
      data-testid={testId}
      className={`flex items-center justify-center border border-stone-200 bg-stone-100 font-semibold text-stone-700 ${sizeClasses} ${radiusClasses}`}
      aria-label={imageAlt}
    >
      {initials}
    </div>
  );
}
