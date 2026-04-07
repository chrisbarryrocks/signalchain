export function LoadingState({ label }: { label: string }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-5 text-sm text-slate-300">
      {label}
    </div>
  );
}
