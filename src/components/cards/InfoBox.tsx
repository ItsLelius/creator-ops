type InfoBoxProps = {
  label: string;
  value: string;
  className?: string;
};

export function InfoBox({ label, value, className = "" }: InfoBoxProps) {
  return (
    <div
      className={`min-w-0 rounded-lg border border-white/10 bg-[#111318] p-3 ${className}`}
    >
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-white" title={value}>
        {value}
      </p>
    </div>
  );
}

export function TextPanel({ label, value }: InfoBoxProps) {
  return (
    <div className="mt-4 min-w-0 rounded-lg border border-white/10 bg-[#111318] p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <div className="scroll-panel max-h-[130px] overflow-y-auto pr-1">
        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-300">
          {value}
        </p>
      </div>
    </div>
  );
}