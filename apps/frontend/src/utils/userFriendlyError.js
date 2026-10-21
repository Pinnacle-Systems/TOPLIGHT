/**
 * Utility to convert raw database/API/Prisma/Oracle error messages
 * into clear, actionable, user-friendly explanations.
 */

export function formatUserFriendlyError(error, defaultMessage = "The request could not be processed.") {
    if (!error) return defaultMessage;

    let raw = "";
    if (typeof error === 'string') {
        raw = error;
    } else if (error?.data?.message) {
        raw = error.data.message;
    } else if (error?.data?.error?.message) {
        raw = error.data.error.message;
    } else if (typeof error?.data?.error === 'string') {
        raw = error.data.error;
    } else if (error?.message) {
        raw = error.message;
    } else if (typeof error?.error === 'string') {
        raw = error.error;
    } else if (error?.error?.message) {
        raw = error.error.message;
    }

    if (!raw || typeof raw !== 'string') return defaultMessage;

    const lower = raw.toLowerCase();

    // 1. HOD issues
    if (
        lower.includes('permissionhod') || 
        lower.includes('leavehod') || 
        (lower.includes('hod') && (lower.includes('not assigned') || lower.includes('not found') || lower.includes('not registered') || lower.includes('foreign key') || lower.includes('constraint') || lower.includes('p2003')))
    ) {
        return "Reporting HOD is not assigned or not registered in the system. Please ask your administrator to assign a valid HOD in User Control.";
    }

    // 2. HR issues
    if (lower.includes('hr') && (lower.includes('not assigned') || lower.includes('not found') || lower.includes('foreign key'))) {
        return "Reporting HR is not assigned to your account. Please contact your administrator.";
    }

    // 3. User account / Employee ID issues
    if (
        lower.includes('create_user') || 
        lower.includes('leave_created_by') || 
        lower.includes('modified_user') ||
        (lower.includes('user') && (lower.includes('not found') || lower.includes('does not exist') || lower.includes('idcard') || lower.includes('p2025')))
    ) {
        return "Your employee account is not registered in User Control. Please contact your administrator.";
    }

    // 4. Category issues
    if (lower.includes('category') || lower.includes('permision_category') || lower.includes('leave_category')) {
        return "The selected category is invalid or no longer active. Please choose a different category.";
    }

    // 5. Document ID duplicate
    if (lower.includes('docid') || lower.includes('unique constraint') || lower.includes('p2002') || lower.includes('ora-00001')) {
        return "A request with this document number already exists. Please refresh and try again.";
    }

    // 6. Oracle / ERP connection
    if (lower.includes('ora-') || lower.includes('njs-') || lower.includes('database connection') || lower.includes('connection refused') || lower.includes('econnrefused') || lower.includes('timeout')) {
        return "ERP database is currently unreachable. Please verify your connection or try again shortly.";
    }

    // 7. If raw error is already a clean, human-readable sentence (not technical code dump)
    if (
        !lower.includes('prismaclient') && 
        !lower.includes('syntaxerror') && 
        !lower.includes('object object') && 
        !lower.includes('call:') && 
        !lower.includes('at ') &&
        raw.length < 180
    ) {
        return raw;
    }

    return defaultMessage;
}
