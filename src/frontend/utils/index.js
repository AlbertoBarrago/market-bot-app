import {hideMainButton, setMainButton, tg, isTelegramEnv} from "./telegram.js";
import {renderCatalog} from "../components/Catalog.js";
import {renderVideoDetails} from "../components/ProductDetails.js";
import {renderPurchases} from "../components/Purchases.js";

let currentPage = 'catalog';
let selectedProduct = null;
let purchases = [];

const app = document.querySelector('#app');
const API_URL = import.meta.env.PROD ? 'https://market-bot-app-qs1elg.fly.dev' : 'http://localhost:3000';

// Create back button for web browsers
function createWebBackButton() {
    const existingBtn = document.querySelector('.web-back-btn');
    if (existingBtn) existingBtn.remove();

    const backBtn = document.createElement('button');
    backBtn.className = 'web-back-btn';
    backBtn.textContent = '← Back';
    backBtn.onclick = () => {
        if (currentPage === 'details' || currentPage === 'purchases') {
            void navigateTo('catalog');
        }
    };
    document.body.prepend(backBtn);
}

function removeWebBackButton() {
    const existingBtn = document.querySelector('.web-back-btn');
    if (existingBtn) existingBtn.remove();
}

// Create action button for web browsers
function createWebActionButton(text, onClick) {
    const existingBtn = document.querySelector('.web-action-btn');
    if (existingBtn) existingBtn.remove();

    const actionBtn = document.createElement('button');
    actionBtn.className = 'web-action-btn';
    actionBtn.textContent = text;
    actionBtn.onclick = onClick;
    document.body.appendChild(actionBtn);
}

function removeWebActionButton() {
    const existingBtn = document.querySelector('.web-action-btn');
    if (existingBtn) existingBtn.remove();
}

/**
 * Navigates to the given page
 * @param page
 * @param data
 * @returns {Promise<void>}
 */
async function navigateTo(page, data = null) {
    currentPage = page;

    app.innerHTML = '';

    hideMainButton();
    if (!isTelegramEnv) {
        removeWebActionButton();
    }

    if (page !== 'catalog') {
        tg.BackButton.show();
        if (!isTelegramEnv) {
            createWebBackButton();
        }
    } else {
        tg.BackButton.hide();
        if (!isTelegramEnv) {
            removeWebBackButton();
        }
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

                const buttonText = isPurchased ? "Download Now" : `Buy for $${selectedProduct.price}`;
                const buttonAction = () => {
                    if (isPurchased) {
                        alert(`Downloading ${selectedProduct.title}...`);
                    } else {
                        tg.showConfirm(`Buy ${selectedProduct.title} for $${selectedProduct.price}?`, (confirmed) => {
                            if (confirmed) {
                                purchases.push(selectedProduct);
                                tg.showAlert("Purchase successful!");
                                navigateTo('purchases');
                            }
                        });
                    }
                };

                setMainButton(buttonText, buttonAction);
                if (!isTelegramEnv) {
                    createWebActionButton(buttonText, buttonAction);
                }
            }
            break;

        case 'purchases':
            renderPurchases(app, purchases);
            break;
    }
}

/**
 * Fetches products from the API
 * @returns {Promise<any|*[]>}
 */
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

tg.BackButton.onClick(() => {
    if (currentPage === 'details' || currentPage === 'purchases') {
        void navigateTo('catalog');
    }
});

export {navigateTo};