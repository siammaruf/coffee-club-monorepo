export const formatPrettyDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const getOrdinal = (n: number) => {
        if (n > 3 && n < 21) return 'th';
        switch (n % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    const minuteStr = minutes < 10 ? `0${minutes}` : minutes;
    return `${day}${getOrdinal(day)} ${month} ${year}, ${hour12}:${minuteStr} ${ampm}`;
};

// Returns: "28th July 2025"
export const formatPrettyDateOnly = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const getOrdinal = (n: number) => {
        if (n > 3 && n < 21) return 'th';
        switch (n % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };
    return `${day}${getOrdinal(day)} ${month} ${year}`;
};

export const withTimeout = <T>(promise: Promise<T>, timeoutMs = 10000): Promise<T> =>
  Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(undefined as T), timeoutMs)),
  ]);
