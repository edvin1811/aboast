import { redirect } from "next/navigation";

// Template gallery is now Studio's "Widgets" tab.
export default function WidgetTemplatesPage() {
  redirect("/dashboard/studio");
}
