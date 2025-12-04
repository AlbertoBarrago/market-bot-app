import './style.css';
import {initTelegram, setMainButton, hideMainButton, tg} from './utils/telegram.js';
import {renderCatalog} from './components/Catalog.js';
import {renderVideoDetails} from './components/ProductDetails.js';
import {renderPurchases} from './components/Purchases.js';

let currentPage = 'catalog';
let selectedProduct = null;
let purchases = [];

const app = document.querySelector('#app');
const API_URL = import.meta.env.PROD ? 'https://market-bot-app-qs1elg.fly.dev' : 'http://localhost:3000';

async function fetchProducts() {
    try {
        const response = await fetch(`${API_URL}/api/products`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return [];
    }
}

async function navigateTo(page, data = null) {
    currentPage = page;

    app.innerHTML = '';

    hideMainButton();

    if (page !== 'catalog') {
        tg.BackButton.show();
    } else {
        tg.BackButton.hide();
    }

    switch (page) {
        case 'catalog':
            const products = await fetchProducts();
            renderCatalog(app, products, (product) => {
                selectedProduct = product;
                navigateTo('details');
            });
            if (purchases.length > 0) {
                const btn = document.createElement('button');
                btn.className = 'view-purchases-btn';
                btn.textContent = `View Purchases (${purchases.length})`;
                btn.onclick = () => navigateTo('purchases');
                app.appendChild(btn);
            }
            break;

        case 'details':
            if (selectedProduct) {
                renderVideoDetails(app, selectedProduct);

                const isPurchased = purchases.some(p => p.id === selectedProduct.id);

                if (isPurchased) {
                    setMainButton("Download Now", () => {
                        alert(`Downloading ${selectedProduct.title}...`);
                    });
                } else {
                    setMainButton(`Buy for $${selectedProduct.price}`, () => {
                        // Mock purchase
                        tg.showConfirm(`Buy ${selectedProduct.title} for $${selectedProduct.price}?`, (confirmed) => {
                            if (confirmed) {
                                purchases.push(selectedProduct);
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

initTelegram();

tg.BackButton.onClick(() => {
    if (currentPage === 'details' || currentPage === 'purchases') {
        navigateTo('catalog');
    }
});

void navigateTo('catalog');
