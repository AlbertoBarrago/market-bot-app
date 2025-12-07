// Mock Telegram WebApp for non-Telegram browsers
const mockTelegram = {
	ready: () => {},
	expand: () => {},
	MainButton: {
		setText: () => {},
		show: () => {},
		hide: () => {},
		onClick: () => {},
		offClick: () => {}
	},
	BackButton: {
		show: () => {},
		hide: () => {},
		onClick: () => {}
	},
	showConfirm: (message, callback) => {
		const confirmed = window.confirm(message);
		callback(confirmed);
	},
	showAlert: (message) => {
		window.alert(message);
	}
};

export const tg = window.Telegram?.WebApp || mockTelegram;
export const isTelegramEnv = !!window.Telegram?.WebApp;

export function initTelegram() {
	tg.ready();
	tg.expand();
}

export function setMainButton(text, onClick, isVisible = true) {
	if (isVisible) {
		tg.MainButton.setText(text);
		tg.MainButton.show();
		tg.MainButton.onClick(onClick);
	} else {
		tg.MainButton.hide();
		tg.MainButton.offClick(onClick);
	}
}

export function hideMainButton() {
	tg.MainButton.hide();
}
