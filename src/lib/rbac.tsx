import { ReactNode } from "react";
import { useMeQuery } from "@/hooks/api/useUserHooks";

export const ROLES = {
  Reader: "Reader",
  Reporter: "Reporter",
  SectionHead: "SectionHead",
  DeskEditor: "DeskEditor",
  ManagingEditor: "ManagingEditor",
  LanguageReviewer: "LanguageReviewer",
  Publisher: "Publisher",
  SystemAdmin: "SystemAdmin",
  AdsAnalytics: "AdsAnalytics"
} as const;

export type Role = keyof typeof ROLES;

export function useRBAC() {
  const { data: user } = useMeQuery();

  const hasRole = (role: Role | string) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  const hasAnyRole = (roles: (Role | string)[]) => {
    if (!user || !user.roles) return false;
    return roles.some(r => user.roles.includes(r));
  };

  const isAdmin = () => hasRole(ROLES.SystemAdmin);
  
  const isEditor = () => hasAnyRole([
    ROLES.ManagingEditor, 
    ROLES.DeskEditor, 
    ROLES.SectionHead, 
    ROLES.LanguageReviewer, 
    ROLES.Reporter
  ]);

  const canAccessDashboard = () => hasAnyRole([
    ROLES.SystemAdmin,
    ROLES.ManagingEditor,
    ROLES.DeskEditor,
    ROLES.SectionHead,
    ROLES.LanguageReviewer,
    ROLES.Reporter,
    ROLES.Publisher,
    ROLES.AdsAnalytics
  ]);

  return { hasRole, hasAnyRole, isAdmin, isEditor, canAccessDashboard, userRoles: user?.roles || [] };
}

interface RequireRoleProps {
  roles: (Role | string)[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequireRole({ roles, children, fallback = null }: RequireRoleProps) {
  const { hasAnyRole } = useRBAC();
  
  if (hasAnyRole(roles)) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}
