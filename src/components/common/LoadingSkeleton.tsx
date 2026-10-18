export function LoadingSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-dvh w-full items-center justify-center bg-background"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-muted border-t-primary [animation-duration:700ms]" />
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </div>
    </div>
  );
}
