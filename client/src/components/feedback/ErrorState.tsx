export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-rose-400/30 bg-rose-400/10 p-5 text-sm text-rose-200">
      {message}
    </div>
  );
}
