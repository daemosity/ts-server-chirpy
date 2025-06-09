export type Chirp = {
    body: string;
};

export function isChirp(chirp: any): chirp is Chirp {
    return (
        chirp &&
        typeof chirp === 'object' &&
        'body' in chirp &&
        typeof chirp.body === 'string'
    );
}