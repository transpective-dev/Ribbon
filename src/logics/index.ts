import './global.ts'

// paths
import "./path.ts";

process.on('uncaughtException', (err) =>
{
	process.exit(1);
});

process.on('unhandledRejection', (err) =>
{
	process.exit(1);
});

// user's platform etc
import '../../env.ts'

// cmd-load logic
import './cmd-hub.ts'