import { CircleDot } from "lucide-react";

type ActivityRowProps = {
  activity: string;
  index: number;
};

export function ActivityRow({ activity, index }: ActivityRowProps) {
  return (
    <div className="flex gap-3 rounded-2xl bg-[#171A21] p-3">
      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-300">
        <CircleDot className="h-4 w-4" />
      </div>

      <div>
        <p className="text-sm font-medium text-white">{activity}</p>
        <p className="mt-1 text-xs text-slate-500">
          {index === 0 ? "Just now" : `${index + 4} minutes ago`}
        </p>
      </div>
    </div>
  );
}