import { redirect } from "next/navigation";

// /dashboard/widgets folded into /dashboard/studio — Studio is now the single
// hub for creating and managing widgets + walls.
export default function WidgetsPage() {
  redirect("/dashboard/studio");
}
