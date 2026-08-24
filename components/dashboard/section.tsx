export function DashboardSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-border py-12 last:border-b-0">
      <div className="flex items-center gap-2.5">
        <span className="h-5 w-1 rounded-full bg-turquoise-500" aria-hidden />
        <h2 className="text-xl font-semibold text-navy-700">{title}</h2>
      </div>
      {description && <p className="mt-1 pl-3.5 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}
