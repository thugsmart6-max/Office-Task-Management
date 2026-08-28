import { Header } from "@/components/shell/Header";
import { Role } from "@/types";
import { ReactNode, Suspense } from "react";

export function AppShell({
  children,
  role,
  name,
  overdue,
}: {
  children: ReactNode;
  role: Role;
  name?: string | null;
  overdue?: number;
}) {
  return (
    <div className="relative min-h-full">
      <Suspense fallback={null}>
        <Header role={role} name={name} overdue={overdue} />
      </Suspense>
      <main className="ws-main mx-auto w-full min-w-0 px-3 pt-3 sm:px-6 sm:pt-5 md:px-10 md:pt-6 lg:px-14 xl:max-w-[90rem] xl:px-16 2xl:max-w-[110rem] 2xl:px-24">
        {children}
      </main>
    </div>
  );
}
