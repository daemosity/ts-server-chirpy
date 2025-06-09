export const filth = [
    "kerfuffle",
    "sharbert",
    "fornax"
];

export function cleanFilth(chirp: string) {
    return filth.reduce((endState, currentFilth) => {
        const regex = RegExp(` ${currentFilth} `, "ig");
        return  endState.replace(regex, " **** ");
    }, chirp)
}