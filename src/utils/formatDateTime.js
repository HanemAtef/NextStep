/**
 * @param {Date|string} dateTime - كائن التاريخ أو سلسلة نصية
 * @param {Object} options - خيارات التنسيق
 * @returns {string} التاريخ والوقت المنسق
 */
const formatDateTime = (dateTime, options = {}) => {
    const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;

    const defaultOptions = {
        dateStyle: 'medium',
        timeStyle: 'short',
        ...options
    };

    try {
        return new Intl.DateTimeFormat('ar-SA', defaultOptions).format(date);
    } catch (error) {
        return `${date.toLocaleDateString('ar-SA')} ${date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}`;
    }
};

export default formatDateTime; 