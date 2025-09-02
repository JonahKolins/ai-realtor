// потенциальные места расположения клавиш
export enum KeyboardLocation {
	GeneralKeys = 0,
	NumPad = 3,

}

class KeyDescriptor {
	readonly which: number;					// числовой код
	readonly key: string;					// название
	readonly code: string;					// точное название
	readonly location: KeyboardLocation;	// источник

	constructor(which: number, key: string, code: string, location: KeyboardLocation) {
		this.which = which;
		this.key = key;
		this.code = code;
		this.location = location;
	}
}

// перечень клавиш с полным описанием
// для проверки поможет сервис https://keycode.info/
export class KeyboardKey {
	static readonly Escape: KeyDescriptor = 	new KeyDescriptor(27, 'Escape', 'Escape', KeyboardLocation.GeneralKeys);
	static readonly Enter: KeyDescriptor = 		new KeyDescriptor(13, 'Enter', 'Enter', KeyboardLocation.GeneralKeys);
	static readonly Space: KeyDescriptor = 		new KeyDescriptor(32, ' ', 'Space', KeyboardLocation.GeneralKeys);
	static readonly Tab: KeyDescriptor = 		new KeyDescriptor(9,  'Tab', 'Tab', KeyboardLocation.GeneralKeys);
	//
	static readonly Home: KeyDescriptor = 		new KeyDescriptor(36, 'Home', 'Home', KeyboardLocation.GeneralKeys);
	static readonly End: KeyDescriptor = 		new KeyDescriptor(35, 'End', 'End', KeyboardLocation.GeneralKeys);
	static readonly PageUp: KeyDescriptor = 	new KeyDescriptor(33, 'PageUp', 'PageUp', KeyboardLocation.GeneralKeys);
	static readonly PageDown: KeyDescriptor = 	new KeyDescriptor(34, 'PageDown', 'PageDown', KeyboardLocation.GeneralKeys);
	//
	static readonly Left: KeyDescriptor = 		new KeyDescriptor(37, 'ArrowLeft', 'ArrowLeft', KeyboardLocation.GeneralKeys);
	static readonly Right: KeyDescriptor = 		new KeyDescriptor(39, 'ArrowRight', 'ArrowRight', KeyboardLocation.GeneralKeys);
	static readonly Up: KeyDescriptor = 		new KeyDescriptor(38, 'ArrowUp', 'ArrowUp', KeyboardLocation.GeneralKeys);
	static readonly Down: KeyDescriptor = 		new KeyDescriptor(40, 'ArrowDown', 'ArrowDown', KeyboardLocation.GeneralKeys);
	//
	static readonly EnterNum: KeyDescriptor = 	new KeyDescriptor(13, 'Enter', 'NumpadEnter', KeyboardLocation.NumPad);
	//
	static readonly HomeNum: KeyDescriptor =	new KeyDescriptor(36, 'Home', 'Numpad7', KeyboardLocation.NumPad);
	static readonly EndNum: KeyDescriptor = 	new KeyDescriptor(35, 'End', 'Numpad1', KeyboardLocation.NumPad);
	static readonly PageUpNum: KeyDescriptor = 	new KeyDescriptor(33, 'PageUp', 'Numpad9', KeyboardLocation.NumPad);
	static readonly PageDownNum: KeyDescriptor =new KeyDescriptor(34, 'PageDown', 'Numpad3', KeyboardLocation.NumPad);
	//
	static readonly LeftNum: KeyDescriptor = 	new KeyDescriptor(37, 'ArrowLeft', 'Numpad4', KeyboardLocation.NumPad);
	static readonly RightNum: KeyDescriptor = 	new KeyDescriptor(39, 'ArrowRight', 'Numpad6', KeyboardLocation.NumPad);
	static readonly UpNum: KeyDescriptor = 		new KeyDescriptor(38, 'ArrowUp', 'Numpad8', KeyboardLocation.NumPad);
	static readonly DownNum: KeyDescriptor = 	new KeyDescriptor(40, 'ArrowDown', 'Numpad2', KeyboardLocation.NumPad);

	static readonly F3: KeyDescriptor = 	new KeyDescriptor(114, 'F3', 'F3', KeyboardLocation.GeneralKeys);

	static readonly f: KeyDescriptor = 	new KeyDescriptor(70, 'f', 'KeyF', KeyboardLocation.GeneralKeys);
	static readonly F: KeyDescriptor = 	new KeyDescriptor(70, 'F', 'KeyF', KeyboardLocation.GeneralKeys);

	static readonly t: KeyDescriptor = 	new KeyDescriptor(84, 't', 'KeyT', KeyboardLocation.GeneralKeys);
	static readonly T: KeyDescriptor = 	new KeyDescriptor(84, 'T', 'KeyT', KeyboardLocation.GeneralKeys);
}
