export type GenerationFilterValue = 1 | 2 | 3;

type RelationshipRoleInput = {
  gender: string | null;
  hasParent: boolean;
  hasSpouse: boolean;
  childCount: number;
};

const birthDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

export function normalizeGenerationFilter(rawValue?: string): GenerationFilterValue | null {
  if (!rawValue) {
    return null;
  }

  const parsed = Number.parseInt(rawValue, 10);
  if (parsed === 1 || parsed === 2 || parsed === 3) {
    return parsed;
  }

  return null;
}

export function formatBirthDate(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return birthDateFormatter.format(date);
}

export function deriveRelationshipLabel({
  gender,
  hasParent,
  hasSpouse,
  childCount
}: RelationshipRoleInput) {
  if (childCount > 0) {
    if (gender === "male") {
      return "Ayah";
    }

    if (gender === "female") {
      return "Ibu";
    }

    return "Orang Tua";
  }

  if (hasParent) {
    return "Anak";
  }

  if (hasSpouse) {
    return "Pasangan";
  }

  return "Anggota";
}

function hashName(name: string) {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function getAvatarFallbackStyle(name: string) {
  const hue = hashName(name) % 360;
  return {
    backgroundColor: `hsl(${hue} 55% 88%)`,
    color: `hsl(${hue} 35% 28%)`,
    borderColor: `hsl(${hue} 42% 74%)`
  };
}
