const tanggalFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric"
});

export function formatTanggal(dateStr: string | null | undefined) {
  if (!dateStr) {
    return null;
  }

  const date = new Date(`${dateStr}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return dateStr;
  }

  return tanggalFormatter.format(date);
}
