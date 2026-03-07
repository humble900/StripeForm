import AdminClient from "./AdminClient";
import { AdminAuthProvider } from "@/components/providers/AdminAuthProvider";

export default function AdminPage() {
  return (
    <AdminAuthProvider>
      <AdminClient />
    </AdminAuthProvider>
  );
}
