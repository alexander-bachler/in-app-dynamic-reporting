import { LRUCache } from 'lru-cache';

const options = {
    max: 500, // Maximum number of items in the cache
    maxAge: 1000 * 60 * 60 // Maximum age in ms (1 hour)
};

const cache = new LRUCache<string, any[]>(options);

export default cache;