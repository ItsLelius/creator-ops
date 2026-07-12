type HeaderProps = {
  roleLabel: string;
};

export function Header({ roleLabel }: HeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6">
      <div>
        <p className="text-sm text-slate-500">Workspace</p>
        <h2 className="text-base font-semibold text-white">Adi Studios</h2>
      </div>

      <div className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-300">
        {roleLabel}
      </div>
    </header>
  );
}