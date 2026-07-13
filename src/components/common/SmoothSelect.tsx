import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

type Option = {
  label: string;
  value: string;
};

type SmoothSelectProps = {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
};

export function SmoothSelect({ value, options, onChange }: SmoothSelectProps) {
  const [open, setOpen] = useState(false);

  const selected = options.find((option) => option.value === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#0B0D10] px-3 py-2.5 text-left text-sm text-slate-200 transition hover:border-white/20 hover:bg-[#14171d]"
      >
        <span className="truncate">{selected?.label ?? "Select"}</span>

        <ChevronDown
          className={[
            "h-4 w-4 shrink-0 text-slate-500 transition",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open && (
        <div className="dropdown-transition absolute left-0 top-full z-40 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#0B0D10] p-1 shadow-2xl shadow-black/50">
          {options.map((option) => {
            const active = option.value === value;

            return (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={[
                  "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition",
                  active
                    ? "bg-blue-500 text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white",
                ].join(" ")}
              >
                <span>{option.label}</span>
                {active && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}