export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="h-full w-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
