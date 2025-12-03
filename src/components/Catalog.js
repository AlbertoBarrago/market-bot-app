import { videos } from '../data/videos.js';

export function renderCatalog(container, onVideoSelect) {
	container.innerHTML = `
    <div class="catalog-header">
      <h2>Video Catalog</h2>
    </div>
    <div class="video-list">
      ${videos.map(video => `
        <div class="video-item" data-id="${video.id}">
          <img src="${video.thumbnail}" alt="${video.title}" class="video-thumb">
          <div class="video-info">
            <h3>${video.title}</h3>
            <p class="price">$${video.price}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;

	// Add event listeners
	container.querySelectorAll('.video-item').forEach(item => {
		item.addEventListener('click', () => {
			const id = parseInt(item.dataset.id);
			const video = videos.find(v => v.id === id);
			onVideoSelect(video);
		});
	});
}
