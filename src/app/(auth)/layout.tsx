export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-full items-center justify-center p-4 bg-background">
      {children}
    </main>
  );
}
