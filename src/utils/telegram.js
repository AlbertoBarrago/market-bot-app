export const tg = window.Telegram.WebApp;

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
