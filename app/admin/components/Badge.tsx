type BadgeProps = {
  type: "campaign" | "status";
  value: string;
};

export function Badge({ type, value }: BadgeProps) {
  const campaignColors: Record<string, string> = {
    morrisons: "#facc15",
    asda: "#22c55e",
    coop: "#3b82f6",
    sainsburys: "#ef4444",
    justeat: "#fb923c",
    bolt: "#111827",
    next: "#374151",
    pcp: "#6366f1",
    dpf: "#a855f7",
    bmw: "#0ea5e9",
  };

  let background = "#d1d5db"; // default grey

  if (type === "campaign") {
    background = campaignColors[value] ?? "#9ca3af";
  }

  if (type === "status") {
    background = value === "sold" ? "#22c55e" : "#9ca3af";
  }

  return (
    <span
      style={{
        background,
        color: "#fff",
        padding: "4px 8px",
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 600,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {value}
      {type === "status" && value === "sold" && " ✅"}
    </span>
  );
}
