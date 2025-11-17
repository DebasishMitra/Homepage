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
  drive: { name: 'Drive', icon: '💾', color: '#43e97b' },
  music: { name: 'Music', icon: '🎵', color: '#fa709a' },
  video: { name: 'Video', icon: '🎬', color: '#fee140' },
  social: { name: 'Social', icon: '💬', color: '#30cfd0' },
  shopping: { name: 'Shopping', icon: '🛒', color: '#a8edea' }
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

let currentSearchEngine = localStorage.getItem('searchEngine') || 'google';

const searchEngines = {
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
  yahoo: 'https://search.yahoo.com/search?p=',
  yandex: 'https://yandex.com/search/?text='
};

function setActiveSearchEngine(engine) {
  currentSearchEngine = engine;
  localStorage.setItem('searchEngine', engine);
  
  document.querySelectorAll('.search-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.engine === engine) {
      tab.classList.add('active');
    }
  });
}

document.querySelectorAll('.search-tab').forEach(tab => {
  tab.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveSearchEngine(tab.dataset.engine);
  });
});

setActiveSearchEngine(currentSearchEngine);

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
      const searchUrl = searchEngines[currentSearchEngine] + encodeURIComponent(query);
      window.location.href = searchUrl;
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

async function loadWeather() {
  const weatherWidget = document.getElementById('weatherWidget');
  
  if (!navigator.geolocation) {
    weatherWidget.innerHTML = '<div class="weather-error">Location not available</div>';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=celsius`
        );
        const data = await response.json();
        const weather = data.current_weather;
        
        const weatherCodes = {
          0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
          45: '🌫️', 48: '🌫️',
          51: '🌦️', 53: '🌦️', 55: '🌦️',
          61: '🌧️', 63: '🌧️', 65: '🌧️',
          71: '🌨️', 73: '🌨️', 75: '🌨️',
          95: '⛈️'
        };
        
        const icon = weatherCodes[weather.weathercode] || '🌤️';
        const temp = Math.round(weather.temperature);
        
        weatherWidget.innerHTML = `
          <div class="weather-display">
            <span class="weather-icon">${icon}</span>
            <span class="weather-temp">${temp}°C</span>
          </div>
        `;
      } catch (error) {
        weatherWidget.innerHTML = '<div class="weather-error">Weather unavailable</div>';
      }
    },
    () => {
      weatherWidget.innerHTML = '<div class="weather-error">Location denied</div>';
    }
  );
}

loadWeather();
setInterval(loadWeather, 600000);

function loadProfile() {
  const saved = localStorage.getItem('profile');
  if (saved) {
    const profile = JSON.parse(saved);
    const profilePhoto = document.getElementById('profilePhoto');
    
    if (profile.imageUrl) {
      profilePhoto.innerHTML = `<img src="${profile.imageUrl}" alt="Profile">`;
    }
  }
}

function saveProfile() {
  const imageUrl = document.getElementById('profileImageUrl').value.trim();
  const name = document.getElementById('userName').value.trim();
  
  const profile = { imageUrl, name };
  localStorage.setItem('profile', JSON.stringify(profile));
  
  loadProfile();
  closeProfileModal();
}

function closeProfileModal() {
  document.getElementById('profileModal').classList.remove('active');
}

document.getElementById('profilePhoto').addEventListener('click', () => {
  const saved = localStorage.getItem('profile');
  if (saved) {
    const profile = JSON.parse(saved);
    document.getElementById('profileImageUrl').value = profile.imageUrl || '';
    document.getElementById('userName').value = profile.name || '';
  }
  document.getElementById('profileModal').classList.add('active');
});

document.getElementById('closeProfileModal').addEventListener('click', closeProfileModal);
document.getElementById('cancelProfileBtn').addEventListener('click', closeProfileModal);
document.getElementById('saveProfileBtn').addEventListener('click', saveProfile);

document.getElementById('profileModal').addEventListener('click', (e) => {
  if (e.target.id === 'profileModal') {
    closeProfileModal();
  }
});

loadProfile();

const musicTracks = [
  { name: 'Lofi Beats - Chill Vibes', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { name: 'Ambient Relaxation', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { name: 'Study Music - Focus Mode', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }
];

let currentTrackIndex = 0;
let isPlaying = false;
let currentTime = 0;
let musicInterval = null;
let audioPlayer = new Audio();

audioPlayer.addEventListener('loadedmetadata', () => {
  updateMusicUI();
});

audioPlayer.addEventListener('timeupdate', () => {
  currentTime = Math.floor(audioPlayer.currentTime);
  updateMusicUI();
});

audioPlayer.addEventListener('ended', () => {
  nextTrack();
});

function loadTrack(index) {
  const track = musicTracks[index];
  audioPlayer.src = track.url;
  document.getElementById('trackName').textContent = track.name;
  currentTime = 0;
}

function updateMusicUI() {
  const currentMinutes = Math.floor(currentTime / 60);
  const currentSeconds = currentTime % 60;
  const totalMinutes = Math.floor(audioPlayer.duration / 60) || 0;
  const totalSeconds = Math.floor(audioPlayer.duration % 60) || 0;
  
  document.getElementById('currentTime').textContent = 
    `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')}`;
  document.getElementById('totalTime').textContent = 
    `${totalMinutes}:${totalSeconds.toString().padStart(2, '0')}`;
  
  const progress = audioPlayer.duration ? (currentTime / audioPlayer.duration) * 100 : 0;
  document.getElementById('progressFill').style.width = `${progress}%`;
}

function togglePlay() {
  isPlaying = !isPlaying;
  const playBtn = document.getElementById('playBtn');
  
  if (isPlaying) {
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    audioPlayer.play();
  } else {
    playBtn.innerHTML = '<i class="fas fa-play"></i>';
    audioPlayer.pause();
  }
}

function nextTrack() {
  currentTrackIndex = (currentTrackIndex + 1) % musicTracks.length;
  loadTrack(currentTrackIndex);
  if (isPlaying) {
    audioPlayer.play();
  }
}

function prevTrack() {
  currentTrackIndex = (currentTrackIndex - 1 + musicTracks.length) % musicTracks.length;
  loadTrack(currentTrackIndex);
  if (isPlaying) {
    audioPlayer.play();
  }
}

document.getElementById('playBtn').addEventListener('click', togglePlay);
document.getElementById('nextBtn').addEventListener('click', nextTrack);
document.getElementById('prevBtn').addEventListener('click', prevTrack);

document.getElementById('volumeSlider').addEventListener('input', (e) => {
  const volume = e.target.value / 100;
  audioPlayer.volume = volume;
});

loadTrack(0);
updateMusicUI();

async function loadBackgroundWallpaper() {
  try {
    const response = await fetch('https://source.unsplash.com/random/1920x1080/?nature,landscape');
    const imageUrl = response.url;
    
    const overlay = document.getElementById('backgroundOverlay');
    overlay.style.backgroundImage = `url(${imageUrl})`;
    
    localStorage.setItem('lastWallpaper', imageUrl);
  } catch (error) {
    console.error('Failed to load wallpaper:', error);
  }
}

const savedWallpaper = localStorage.getItem('lastWallpaper');
if (savedWallpaper) {
  document.getElementById('backgroundOverlay').style.backgroundImage = `url(${savedWallpaper})`;
} else {
  loadBackgroundWallpaper();
}

document.getElementById('syncWallpaperBtn').addEventListener('click', () => {
  const btn = document.getElementById('syncWallpaperBtn');
  btn.querySelector('i').classList.add('fa-spin');
  
  loadBackgroundWallpaper().then(() => {
    setTimeout(() => {
      btn.querySelector('i').classList.remove('fa-spin');
    }, 500);
  });
});

async function loadIPInfo() {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    document.getElementById('ipInfo').textContent = `IP: ${data.ip} (${data.city}, ${data.country_name})`;
    document.getElementById('dnsInfo').textContent = `DNS: ${data.org || 'N/A'}`;
    
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = new Date().getTimezoneOffset();
    const offsetHours = Math.abs(Math.floor(offset / 60));
    const offsetMins = Math.abs(offset % 60);
    const offsetSign = offset <= 0 ? '+' : '-';
    
    document.getElementById('timezoneInfo').textContent = 
      `Timezone: ${timezone} (UTC${offsetSign}${offsetHours.toString().padStart(2, '0')}:${offsetMins.toString().padStart(2, '0')})`;
  } catch (error) {
    document.getElementById('ipInfo').textContent = 'IP: Unable to load';
    document.getElementById('dnsInfo').textContent = 'DNS: Unable to load';
    document.getElementById('timezoneInfo').textContent = 'Timezone: ' + Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
}

loadIPInfo();
