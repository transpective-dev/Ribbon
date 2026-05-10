import { type t_suggestion } from "../interface.ts"
import fs from 'fs-extra'

export const saveIntoFile = ({
	path,
	data
}: {
	path: string,
	data: t_suggestion
}) => {
	fs.writeJSONSync(path, data)
}