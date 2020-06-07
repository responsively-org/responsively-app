// based on https://github.com/brrd/electron-is-accelerator/blob/master/index.js
// modified by @jjavierdguezas
// added numpad support

const modifiers = /^(Command|Cmd|Control|Ctrl|CommandOrControl|CmdOrCtrl|Alt|Option|AltGr|Shift|Super)$/;
const keyCodes = /^([0-9A-Z)!@#$%^&*(:+<_>?~{|}";=,\-./`[\\\]']|F1*[1-9]|F10|F2[0-4]|Plus|Space|Tab|Backspace|Delete|Insert|Return|Enter|Up|Down|Left|Right|Home|End|PageUp|PageDown|Escape|Esc|VolumeUp|VolumeDown|VolumeMute|MediaNextTrack|MediaPreviousTrack|MediaStop|MediaPlayPause|PrintScreen|Num0|Num1|Num2|Num3|Num4|Num5|Num6|Num7|Num8|Num9|Numdec|Numadd|Numsub|Nummult|Numdiv)$/;

export function isAccelerator (str) {
    if (str == null || str.length === 0) return false;
	let parts = str.split("+");
	let keyFound = false;
    return parts.every((val, index) => {
        if (val == null || val === '') return false;
        const upper = val[0].toUpperCase() + val.slice(1); 
		const isKey = keyCodes.test(upper);
		const isModifier = modifiers.test(upper);
		if (isKey) {
			// Key must be unique
			if (keyFound) return false;
			keyFound = true;
		}
		// Key is required
		if (index === parts.length - 1 && !keyFound) return false;
        return isKey || isModifier;
    });
};