const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/; // Regex for 'YYYY-MM-DD' format
    if (!dateString.match(regex)) {
        return false;
    }

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};

function formatTime(dateTimeStr) {
    const time = new Date(dateTimeStr).toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    return time;
}


module.exports = {
    isValidDate,
    formatTime
};
