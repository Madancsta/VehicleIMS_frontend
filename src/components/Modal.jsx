import { useEffect } from "react";
import { X } from "lucide-react";
export function Modal({ open, onClose, title, description, children, footer, size = "md", }) {
    useEffect(() => {
        if (!open)
            return;
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [open, onClose]);
    if (!open)
        return null;
    const widths = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" };
    return (<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={onClose}/>
      <div role="dialog" aria-modal="true" className={`relative w-full ${widths[size]} bg-card border border-border rounded-t-xl sm:rounded-xl shadow-elegant max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 sm:zoom-in-95`}>
        <div className="flex items-start justify-between gap-4 p-5 border-b border-border">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold tracking-tight">{title}</h2>
            {description && (<p className="text-xs text-muted-foreground mt-1">{description}</p>)}
          </div>
          <button onClick={onClose} aria-label="Close" className="h-8 w-8 shrink-0 rounded-md hover:bg-surface flex items-center justify-center">
            <X className="h-4 w-4"/>
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
        {footer && (<div className="p-4 border-t border-border bg-surface/50 flex flex-wrap justify-end gap-2 rounded-b-xl">
            {footer}
          </div>)}
      </div>
    </div>);
}
export function Field({ label, children, }) {
    return (<div>
      <label className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div className="mt-1">{children}</div>
    </div>);
}
export const inputCls = "w-full h-10 px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring";
