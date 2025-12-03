import './style.css';
import { initTelegram, setMainButton, hideMainButton, tg } from './utils/telegram.js';
import { renderCatalog } from './components/Catalog.js';
import { renderVideoDetails } from './components/VideoDetails.js';
import { renderPurchases } from './components/Purchases.js';

// State
let currentPage = 'catalog';
let selectedVideo = null;
let purchases = [];

// DOM Elements
const app = document.querySelector('#app');

// Navigation
function navigateTo(page, data = null) {
	currentPage = page;

	// Clear app
	app.innerHTML = '';

	// Reset MainButton
	hideMainButton();

	// Show BackButton if not on home/catalog
	if (page !== 'catalog') {
		tg.BackButton.show();
	} else {
		tg.BackButton.hide();
	}

	switch (page) {
		case 'catalog':
			renderCatalog(app, (video) => {
				selectedVideo = video;
				navigateTo('details');
			});
			// Add a button to go to purchases if we have any
			if (purchases.length > 0) {
				// We can use a floating button or just a link at the bottom.
				// For simplicity, let's append a "View Purchases" button to the container
				const btn = document.createElement('button');
				btn.className = 'view-purchases-btn';
				btn.textContent = `View Purchases (${purchases.length})`;
				btn.onclick = () => navigateTo('purchases');
				app.appendChild(btn);
			}
			break;

		case 'details':
			if (selectedVideo) {
				renderVideoDetails(app, selectedVideo);

				// Check if already purchased
				const isPurchased = purchases.some(p => p.id === selectedVideo.id);

				if (isPurchased) {
					setMainButton("Download Now", () => {
						alert(`Downloading ${selectedVideo.title}...`);
					});
				} else {
					setMainButton(`Buy for $${selectedVideo.price}`, () => {
						// Mock purchase
						tg.showConfirm(`Buy ${selectedVideo.title} for $${selectedVideo.price}?`, (confirmed) => {
							if (confirmed) {
								purchases.push(selectedVideo);
								tg.showAlert("Purchase successful!");
								navigateTo('purchases');
							}
						});
					});
				}
			}
			break;

		case 'purchases':
			renderPurchases(app, purchases);
			break;
	}
}

// Initialize
initTelegram();

// Handle Back Button
tg.BackButton.onClick(() => {
	if (currentPage === 'details' || currentPage === 'purchases') {
		navigateTo('catalog');
	}
});

// Initial render
navigateTo('catalog');
