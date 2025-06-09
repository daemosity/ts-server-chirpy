export function isChirp(chirp) {
    return (chirp &&
        typeof chirp === 'object' &&
        'body' in chirp &&
        typeof chirp.body === 'string');
}
