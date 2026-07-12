type StatusProgressProps = {
  label: string;
  value: number;
  total: number;
  color: string;
};

export function StatusProgress({
  label,
  value,
  total,
  color,
}: StatusProgressProps) {
  const percent = total === 0 ? 0 : Math.round((value / total) * 100);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold text-white">{value}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[#0B0D10]">
        <div
          className={["h-full rounded-full", color].join(" ")}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}