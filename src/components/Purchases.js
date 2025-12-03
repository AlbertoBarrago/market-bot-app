export function renderPurchases(container, purchases) {
	if (purchases.length === 0) {
		container.innerHTML = `
      <div class="empty-state">
        <p>You haven't purchased any videos yet.</p>
      </div>
    `;
		return;
	}

	container.innerHTML = `
    <div class="purchases-header">
      <h2>My Purchases</h2>
    </div>
    <div class="video-list">
      ${purchases.map(video => `
        <div class="video-item purchase-item">
          <img src="${video.thumbnail}" alt="${video.title}" class="video-thumb">
          <div class="video-info">
            <h3>${video.title}</h3>
            <button class="download-btn" onclick="alert('Downloading ${video.title}...')">Download</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}
