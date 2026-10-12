export const MASTER_TABS = [
    {
        id: 'onduty',
        routeKey: 'onduty_master',
        title: 'OnDuty Reasons',
        shortTitle: 'OnDuty',
        subtitle: 'Manage trip purpose categories and status for OnDuty entries',
        icon: 'clock-check-outline',
        color: '#2563EB',
        bgColor: '#EFF6FF',
        tableName: 'OndutyMaster',
        badge: 'Trip Reasons',
        hasPtype: false,
    },
    {
        id: 'permission',
        routeKey: 'm_permission',
        title: 'Permission & Reasons',
        shortTitle: 'Permissions',
        subtitle: 'Manage request categories across Permission, Advance, and Leave',
        icon: 'account-clock-outline',
        color: '#7C3AED',
        bgColor: '#F5F3FF',
        tableName: 'PermissionMaster',
        badge: 'Approvals',
        hasPtype: true,
    },
    {
        id: 'role',
        routeKey: 'page_master',
        title: 'Role & Page Master',
        shortTitle: 'Roles',
        subtitle: 'Configure company organizational roles and page permissions',
        icon: 'shield-account-outline',
        color: '#0D9488',
        bgColor: '#F0FDFA',
        tableName: 'Role',
        badge: 'Access Control',
        hasPtype: false,
    },
];

export const PTYPE_OPTIONS = [
    { label: 'Permission', value: 'permission', color: '#7C3AED' },
    { label: 'Advance', value: 'advance', color: '#DB2777' },
    { label: 'Leave', value: 'leave', color: '#EA580C' },
];

export const STATUS_OPTIONS = [
    { label: 'Active', value: 'Yes', code: 'y', color: '#16A34A' },
    { label: 'Inactive', value: 'No', code: 'N', color: '#DC2626' },
];
