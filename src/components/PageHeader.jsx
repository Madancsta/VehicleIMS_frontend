export function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 border-b border-border mb-6 pb-10 pr-40 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>

        {description && (
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
