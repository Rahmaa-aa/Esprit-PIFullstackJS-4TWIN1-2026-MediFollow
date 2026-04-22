import { useMemo } from "react";
import { useLocation } from "react-router-dom";

/** Préfixes /admin/... vs /super-admin/... pour la liste et le détail des départements. */
export function useDepartmentSectionPaths() {
  const { pathname } = useLocation();
  return useMemo(() => {
    const isSuperAdminDept = pathname.startsWith("/super-admin/departments");
    return {
      isSuperAdminDept,
      listPath: isSuperAdminDept ? "/super-admin/departments" : "/admin/departments",
      dashboardPath: isSuperAdminDept ? "/super-admin/dashboard" : "/admin/dashboard",
    };
  }, [pathname]);
}
