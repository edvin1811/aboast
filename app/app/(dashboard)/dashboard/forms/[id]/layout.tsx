export default function FormEditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-neutral-50 z-50">
      {children}
    </div>
  );
}
