import crypto from 'crypto'
import keytar from 'keytar'

export const srv = 'HLIN'

export const acc_password = "SUDO_KEY_PRIVATE"

export const acc_expiry = "SUDO_KEY_EXPIRY"

export const acc_unique = "GENERAL_ENCRYPT_KEY"

const unique_key = async (): Promise<string> => {
	
	const random = crypto.randomBytes(32).toString('base64')

	const get: string | null = await keytar.getPassword(srv, acc_unique)

	if (get === null) {
		await keytar.setPassword(srv, acc_unique, random)
	}
	
	return get as string;
}

export const general_encrypt_key = await unique_key();