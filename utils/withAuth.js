import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export default function withAuth(Component, { requiredRole = null } = {}) {
  return function ProtectedPage(props) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === "loading") return; // tunggu dulu

      if (status === "unauthenticated") {
        router.replace("/login");
        return;
      }

      if (requiredRole && session?.user?.role !== requiredRole) {
        // Redirect ke dashboard yang sesuai dengan role mereka
        const roleRedirect = session?.user?.role === "guru"
          ? "/dashboard/teacher"
          : "/dashboard/student";
        router.replace(roleRedirect);
      }
    }, [status, session, router]);

    // State 1: Sedang mengecek sesi — tampilkan loading
    if (status === "loading") {
      return (
        <div className="min-h-screen bg-primary-bg flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    // State 2: Belum login — jangan render apapun (redirect sedang berjalan)
    if (status === "unauthenticated") return null;

    // State 3: Role salah — jangan render apapun (redirect sedang berjalan)
    if (requiredRole && session?.user?.role !== requiredRole) return null;

    // State 4: Autentikasi valid — render halaman
    return <Component {...props} />;
  };
}
