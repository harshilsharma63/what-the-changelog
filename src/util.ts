export function capitalized(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export function titalized(str: string): string {
    return str.split(' ').map(x => capitalized(x)).join(' ')
}
