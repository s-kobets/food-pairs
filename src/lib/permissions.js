export const getCurrentUserRole = () => {
    // Check URL search params for role
    const params = new URLSearchParams(window.location.search);
    const roleParam = params.get('role');
    // Validate that the role is valid
    if (roleParam && ['admin', 'editor', 'viewer'].includes(roleParam)) {
        return roleParam;
    }
    // Default to viewer if no valid role in URL
    return 'viewer';
};
export const permissions = {
    canAddFood: (role) => ['admin', 'editor'].includes(role),
    canAddCategory: (role) => ['admin'].includes(role),
    canAddCombination: (role) => ['admin', 'editor'].includes(role)
};
