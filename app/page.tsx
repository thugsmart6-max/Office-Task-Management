import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();
  const role = session?.user?.role;
  if (role === "admin") redirect("/admin/dashboard");
  if (role === "manager") redirect("/manager/dashboard");
  if (role === "user") redirect("/user/dashboard");
  redirect("/login");
}
