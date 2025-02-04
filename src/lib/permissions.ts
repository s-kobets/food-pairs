// You can expand this based on your needs
export type UserRole = 'admin' | 'editor' | 'viewer'

export const getCurrentUserRole = (): UserRole => {
  // Check URL search params for role
  const params = new URLSearchParams(window.location.search)
  const roleParam = params.get('role')

  // Validate that the role is valid
  if (roleParam && ['admin', 'editor', 'viewer'].includes(roleParam)) {
    return roleParam as UserRole
  }

  // Default to viewer if no valid role in URL
  return 'viewer'
}

export const permissions = {
  canAddFood: (role: UserRole) => ['admin', 'editor'].includes(role),
  canAddCategory: (role: UserRole) => ['admin'].includes(role),
  canAddCombination: (role: UserRole) => ['admin', 'editor'].includes(role)
} 