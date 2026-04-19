import chalk from "chalk"

export const pallete = {
    grey: '#303030',
    red: '#FF453A',
    red_alt: '#FF3B30',
    orange: '#FF9F0A',
    yellow: '#FFD60A',
    green: '#32D74B',
    green_alt: '#28CD41',
    teal: '#64D2FF',
    cyan: '#5AC8FA',
    blue: '#0A84FF',
    blue_alt: '#007AFF',
    indigo: '#5E5CE6',
    purple: '#BF5AF2',
    pink: '#FF375F',
    grey_1: '#8E8E93',
    grey_2: '#636366',
    grey_3: '#48484A',
    grey_4: '#3A3A3C',
    grey_5: '#2C2C2E',
    grey_6: '#1C1C1E',
    label: '#FFFFFF',
    secondary_label: '#EBEBF5',
    tertiary_label: '#B0B0B8',
    separator: '#545458',
}

export const colored_prefix = {
    error: chalk.hex(pallete.red)('[ error ]: '),
    success: chalk.hex(pallete.green)('[ success ]: '),
}