export const generateId = () => Math.random().toString(36).substr(2, 9);

export const categories = [
    { id: 'work', label: 'Work', color: '#A2B9C8' },
    { id: 'personal', label: 'Personal', color: '#D8A7B1' },
    { id: 'life', label: 'Life', color: '#9DBF9E' },
    { id: 'study', label: 'Study', color: '#D4A373' }
];

export const priorities = [
    { id: 'low', label: 'Low' },
    { id: 'medium', label: 'Medium' },
    { id: 'high', label: 'High' }
];

export const getCalendarDays = (date) => {
    const start = dayjs(date).startOf('month').startOf('week');
    const end = dayjs(date).endOf('month').endOf('week');
    const days = [];
    let current = start;

    while (current.isBefore(end)) {
        days.push(current);
        current = current.add(1, 'day');
    }
    return days;
};
