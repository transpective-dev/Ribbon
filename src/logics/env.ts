(() => {
    const i = process.platform;
    switch (i) {
        case 'win32': return process.env.USR_PLATFORM = 'win';
        case 'darwin': return process.env.USR_PLATFORM = 'mac';
        case 'linux': return process.env.USR_PLATFORM = 'lnx';
        default: return process.env.USR_PLATFORM = 'unknown';
    }
})();

export const startBy = () => {
	switch (process.env.USR_PLATFORM) {
		case 'win': return 'explorer';
		case 'mac': return 'open';
		case 'lnx': return 'xdg-open';
	}
}