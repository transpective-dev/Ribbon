import keytar from "keytar";
import enquirer from 'enquirer'
import crypto from 'crypto-js'

import { srv, acc_password as acc } from './encryption_utils.ts'
import { cacheManager } from "./timer.ts"

const { prompt } = enquirer

export const get_key = async (): Promise<string | null> =>
{
	return await keytar.getPassword(srv, acc)
}

export const branch = async () =>
{

	const isKeyExist = await get_key();

	if (isKeyExist === null) {

		const initialize_password = async () =>
		{

			const res = await prompt([
				{
					type: "password",
					name: "password",
					message: "Initialize Password",
				}
			])

			if ('password' in res && res.password != '') {

				const password = res.password as string

				if ((/[a-zA-Z0-9_]{8,}/).test(password)) {

					const encrypted = crypto.SHA256(password).toString();

					await keytar.setPassword(srv, acc, encrypted)

					return console.log('Password Initalize Sucessfuly')

				}

			}

			console.log('Password must be at least 8 characters long and contain only letters, numbers, and underscores')

			return await initialize_password()

		}

		return initialize_password()

	}

	if (isKeyExist) {

		const res = await prompt({
			type: "password",
			name: "password",
			message: "Please input Password",
		})

		if ('password' in res && res.password != '') {

			const getHash = crypto.SHA256(res.password as string).toString();

			if (isKeyExist === getHash) {

				await cacheManager?.login();

				return 'Login success'

			}

			return console.log('Incorrect Password. Please Retry')
		}

	}
}