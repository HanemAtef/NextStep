/**
 * تنسيق التاريخ والوقت بالشكل المناسب
 * @param {Date|string} dateTime - كائن التاريخ أو سلسلة نصية
 * @param {Object} options - خيارات التنسيق
 * @returns {string} التاريخ والوقت المنسق
 */
const formatDateTime = (dateTime, options = {}) => {
    // التأكد من أن dateTime هو كائن Date
    const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;

    // خيارات افتراضية
    const defaultOptions = {
        dateStyle: 'medium',
        timeStyle: 'short',
        ...options
    };

    try {
        // استخدام Intl.DateTimeFormat للتنسيق
        return new Intl.DateTimeFormat('ar-SA', defaultOptions).format(date);
    } catch (error) {
        // إذا حدث خطأ، استخدم طريقة بديلة أبسط
        return `${date.toLocaleDateString('ar-SA')} ${date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}`;
    }
};

export default formatDateTime; 