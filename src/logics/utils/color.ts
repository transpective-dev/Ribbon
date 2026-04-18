import chalk from "chalk"

export const pallete = {
    grey: '#303030',
    error: '#E23838'
}

export const colored_prefix = {
    error: chalk.hex(pallete.error)('error: '),
}