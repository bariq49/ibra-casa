// Admins Page - Shows users with role 'admin'
import UsersPage from "./UsersPage";

export default function AdminsPage() {
  // This page mounts UsersPage but with admin-specific context
  // The filtering is done in the UsersPage component based on the path
  return <UsersPage />;
}
