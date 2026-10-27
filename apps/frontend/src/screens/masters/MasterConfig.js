export const MASTER_TABS = [
    {
        id: 'onduty',
        routeKey: 'onduty_master',
        title: 'OnDuty Reasons',
        shortTitle: 'OnDuty',
        subtitle: 'Manage trip purpose categories and status for OnDuty entries',
        icon: 'clock-check-outline',
        tableName: 'OndutyMaster',
        badge: 'Trip Reasons',
        hasPtype: false,
    },
    {
        id: 'permission',
        routeKey: 'm_permission',
        title: 'Permission & Reasons',
        shortTitle: 'Permissions',
        subtitle: 'Manage request categories across Permission and Leave',
        icon: 'account-clock-outline',
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
        tableName: 'Role',
        badge: 'Access Control',
        hasPtype: false,
    },
];

export const PTYPE_OPTIONS = [
    { label: 'Permission', value: 'permission' },
    { label: 'Leave', value: 'leave' },
];
