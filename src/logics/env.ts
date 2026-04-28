export const runtime = process.env.RIB_RUNTIME;

export const platform = (() => {
    const i = process.platform;
    switch (i) {
        case 'win32': return 'win';
        case 'darwin': return 'mac';
        case 'linux': return 'lnx';
        default: return 'unknown';
    }
})();
