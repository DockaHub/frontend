/**
 * Utility functions for masking and sanitizing phone numbers for UI and Evolution API / WhatsApp.
 */

/**
 * Formats a raw phone string into a friendly Brazilian mask: (XX) XXXXX-XXXX or (XX) XXXX-XXXX.
 * Handles inputs with or without DDI (+55).
 */
export const formatPhoneMask = (value?: string | null): string => {
    if (!value) return '';
    let digits = String(value).replace(/\D/g, '');

    // Strip leading 55 if present and length is 12 or 13 digits (55 + DDD + 8/9 digits)
    if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) {
        digits = digits.slice(2);
    }

    // Limit to 11 digits max for local format
    digits = digits.slice(0, 11);

    if (digits.length === 0) return '';
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

/**
 * Sanitizes a phone string into a clean numeric string prefixed with DDI 55 for Evolution API / WhatsApp.
 * E.g. "(11) 99999-8888" -> "5511999998888"
 * E.g. "011999998888" -> "5511999998888"
 */
export const sanitizePhoneForSave = (phone?: string | null): string => {
    if (!phone) return '';
    let digits = String(phone).replace(/\D/g, '');

    // Strip leading zeroes (e.g. 011999998888 -> 11999998888)
    digits = digits.replace(/^0+/, '');

    // Strip leading 0 if 55011... -> 5511...
    if (digits.startsWith('550')) {
        digits = '55' + digits.slice(3);
    }

    // If 10 or 11 digits (Brazilian DDD + number), prepend 55
    if ((digits.length === 10 || digits.length === 11) && !digits.startsWith('55')) {
        digits = '55' + digits;
    }

    return digits;
};
