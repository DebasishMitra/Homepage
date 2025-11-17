const defaultBookmarks = [
  { id: '1', name: 'Gmail', url: 'https://mail.google.com', category: 'mail' },
  { id: '2', name: 'Outlook', url: 'https://outlook.live.com', category: 'mail' },
  { id: '3', name: 'GitHub', url: 'https://github.com', category: 'tools' },
  { id: '4', name: 'Replit', url: 'https://replit.com', category: 'tools' },
  { id: '5', name: 'Google Drive', url: 'https://drive.google.com', category: 'drive' },
  { id: '6', name: 'Dropbox', url: 'https://www.dropbox.com', category: 'drive' },
  { id: '7', name: 'Google Account', url: 'https://myaccount.google.com', category: 'account' },
  { id: '8', name: 'Twitter', url: 'https://twitter.com', category: 'account' }
];

const categories = {
  tools: { name: 'Tools', icon: '🔧', color: '#667eea' },
  mail: { name: 'Mail', icon: '✉️', color: '#f093fb' },
  account: { name: 'Account', icon: '👤', color: '#4facfe' },
  drive: { name: 'Drive', icon: '💾', color: '#43e97b' }
};

let bookmarks = [];
let editingId = null;

function updateTime() {
  const now = new Date();
  
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}`;
  
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateString = now.toLocaleDateString('en-US', options);
  
  document.getElementById('time').textContent = timeString;
  document.getElementById('date').textContent = dateString;
}

updateTime();
setInterval(updateTime, 1000);

document.getElementById('searchForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const searchInput = document.getElementById('searchInput');
  const query = searchInput.value.trim();
  
  if (query) {
    if (query.includes('.') && !query.includes(' ')) {
      let url = query;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      window.location.href = url;
    } else {
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
  }
});

function loadBookmarks() {
  const saved = localStorage.getItem('bookmarks');
  if (saved) {
    bookmarks = JSON.parse(saved);
    
    let migrated = false;
    bookmarks = bookmarks.map(bookmark => {
      if (!bookmark.category) {
        migrated = true;
        return { ...bookmark, category: 'tools' };
      }
      return bookmark;
    });
    
    if (migrated) {
      saveBookmarks();
    }
  } else {
    bookmarks = [...defaultBookmarks];
    saveBookmarks();
  }
  renderBookmarks();
  populateCategoryOptions();
}

function saveBookmarks() {
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

function populateCategoryOptions() {
  const select = document.getElementById('bookmarkCategory');
  select.innerHTML = '';
  
  Object.keys(categories).forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = `${categories[key].icon} ${categories[key].name}`;
    select.appendChild(option);
  });
}

function getFaviconUrl(url) {
  try {
    const domain = new URL(url).origin;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch (e) {
    return '';
  }
}

function renderBookmarks() {
  const container = document.getElementById('linksContainer');
  container.innerHTML = '';
  
  Object.keys(categories).forEach(categoryKey => {
    const categoryBookmarks = bookmarks.filter(b => b.category === categoryKey);
    
    if (categoryBookmarks.length === 0) return;
    
    const categorySection = document.createElement('div');
    categorySection.className = 'category-section';
    
    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'category-header';
    categoryHeader.innerHTML = `
      <span class="category-icon">${categories[categoryKey].icon}</span>
      <span class="category-name">${categories[categoryKey].name}</span>
      <span class="category-count">${categoryBookmarks.length}</span>
    `;
    
    const categoryGrid = document.createElement('div');
    categoryGrid.className = 'category-grid';
    
    categoryBookmarks.forEach(bookmark => {
      const wrapper = document.createElement('div');
      wrapper.className = 'link-card-wrapper';
      
      const card = document.createElement('a');
      card.className = 'link-card';
      card.href = bookmark.url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      
      const faviconUrl = getFaviconUrl(bookmark.url);
      card.innerHTML = `
        <div class="link-icon-wrapper">
          <img src="${faviconUrl}" alt="${bookmark.name}" class="link-favicon" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="link-icon-fallback" style="display: none;">${bookmark.name.charAt(0).toUpperCase()}</div>
        </div>
        <div class="link-name">${bookmark.name}</div>
      `;
      
      const actions = document.createElement('div');
      actions.className = 'link-actions';
      actions.innerHTML = `
        <button class="icon-btn edit" aria-label="Edit ${bookmark.name}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        <button class="icon-btn delete" aria-label="Delete ${bookmark.name}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      `;
      
      const editBtn = actions.querySelector('.edit');
      const deleteBtn = actions.querySelector('.delete');
      
      editBtn.addEventListener('click', (e) => editBookmark(e, bookmark.id));
      deleteBtn.addEventListener('click', (e) => deleteBookmark(e, bookmark.id));
      
      wrapper.appendChild(card);
      wrapper.appendChild(actions);
      categoryGrid.appendChild(wrapper);
    });
    
    categorySection.appendChild(categoryHeader);
    categorySection.appendChild(categoryGrid);
    container.appendChild(categorySection);
  });
}

function openModal(title = 'Add Bookmark') {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('bookmarkModal').classList.add('active');
}

function closeModal() {
  document.getElementById('bookmarkModal').classList.remove('active');
  document.getElementById('bookmarkForm').reset();
  editingId = null;
}

function editBookmark(event, id) {
  event.preventDefault();
  event.stopPropagation();
  
  const bookmark = bookmarks.find(b => b.id === id);
  if (!bookmark) return;
  
  editingId = id;
  document.getElementById('bookmarkName').value = bookmark.name;
  document.getElementById('bookmarkUrl').value = bookmark.url;
  document.getElementById('bookmarkCategory').value = bookmark.category || 'tools';
  
  openModal('Edit Bookmark');
}

function deleteBookmark(event, id) {
  event.preventDefault();
  event.stopPropagation();
  
  if (confirm('Are you sure you want to delete this bookmark?')) {
    bookmarks = bookmarks.filter(b => b.id !== id);
    saveBookmarks();
    renderBookmarks();
  }
}

document.getElementById('addBookmarkBtn').addEventListener('click', () => {
  openModal('Add Bookmark');
});

document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('cancelBtn').addEventListener('click', closeModal);

document.getElementById('bookmarkModal').addEventListener('click', (e) => {
  if (e.target.id === 'bookmarkModal') {
    closeModal();
  }
});

document.getElementById('bookmarkForm').addEventListener('submit', (e) => {
  e.preventDefault();
  
  const name = document.getElementById('bookmarkName').value.trim();
  const url = document.getElementById('bookmarkUrl').value.trim();
  const category = document.getElementById('bookmarkCategory').value;
  
  if (!name || !url || !category) return;
  
  if (editingId) {
    const index = bookmarks.findIndex(b => b.id === editingId);
    if (index !== -1) {
      bookmarks[index] = { ...bookmarks[index], name, url, category };
    }
  } else {
    const newBookmark = {
      id: Date.now().toString(),
      name,
      url,
      category
    };
    bookmarks.push(newBookmark);
  }
  
  saveBookmarks();
  renderBookmarks();
  closeModal();
});

loadBookmarks();
