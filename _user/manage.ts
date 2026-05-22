import { type Cache, cache } from "./schema.ts"
import Conf from "conf"
import _path from "../src/logics/utils/path.ts";

class ControlManager
{

	private cache: Conf<Cache>

	constructor()
	{

		this.cache = new Conf<Cache>({
			configName: 'cache',
			cwd: _path.paths.cache,
			defaults: {
				default: null,
				expiry_time: null
			}
		})

	}
}

const cm = new ControlManager()

export default {
	cm
}

