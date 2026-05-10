
// a: user input

// b: suggestion_list

export function maxCommonChars(a: string, b: string[]): string{

	let _name = '';
	let _score = 0;

	for (let i = 0; i < b.length; i++) {

		let currentStr = b[i];

		let score = 0;

		for (let j = 0; j < a.length; j++) {

			if (currentStr.charAt(j) === (a.charAt(j))) {
				score++;
			}

		}

		if (score > _score) {

			_name = currentStr;
			_score = score;

		}
	}
	return _name;
}
