export function createBrandIconMarkup(size: number, maskable = false) {
  const safePadding = Math.round(size * (maskable ? 0.18 : 0.12));
  const logoRadius = Math.round(size * 0.24);
  const logoFontSize = Math.round(size * 0.26);
  const logoHeight = Math.round(size * 0.58);
  const logoWidth = Math.round(size * 0.58);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg, #f9f7f4 0%, #fef3c7 100%)",
        padding: safePadding
      }}
    >
      <div
        style={{
          width: logoWidth,
          height: logoHeight,
          borderRadius: logoRadius,
          border: `${Math.max(2, Math.round(size * 0.012))}px solid #fcd34d`,
          backgroundColor: "#fffbeb",
          boxShadow: "0 10px 24px rgb(180 83 9 / 0.16)",
          color: "#b45309",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Segoe UI, Inter, Arial, sans-serif",
          fontWeight: 700,
          fontSize: logoFontSize,
          letterSpacing: "-0.04em"
        }}
      >
        KK
      </div>
    </div>
  );
}
