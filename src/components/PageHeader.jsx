export function PageHeader({ title, description, actions, }) {
    return (<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 pb-6 border-b border-border">
      <div className="min-w-0">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
        {description && (<p className="text-muted-foreground text-sm mt-1.5 max-w-xl">{description}</p>)}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>);
}
