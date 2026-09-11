const cache = new Map<string, { data: any, time: number }>();

const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export const cachedFetch = async (url: string, options: any = {}) => {
    // Only cache GET and POST (for profile)
    if (options.method && options.method.toUpperCase() !== 'GET' && options.method.toUpperCase() !== 'POST') {
        const res = await fetch(url, options);
        return res.json();
    }
    
    if (cache.has(url)) {
        const cached = cache.get(url);
        if (cached && Date.now() - cached.time < CACHE_TTL) {
            return cached.data;
        }
    }

    const res = await fetch(url, options);
    const data = await res.json();
    
    if (data.status || data.profile) {
        cache.set(url, { data, time: Date.now() });
    }
    return data;
};

export const clearCache = (matchString?: string) => {
    if (!matchString) {
        cache.clear();
        return;
    }
    for (const key of cache.keys()) {
        if (key.includes(matchString)) {
            cache.delete(key);
        }
    }
};
