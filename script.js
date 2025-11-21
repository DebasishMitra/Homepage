let audioContext;
let futuristicSoundPlayed = false;

function playFuturisticSound() {
  if (futuristicSoundPlayed) return;
  
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  if (audioContext.state === 'suspended') {
    audioContext.resume().then(() => {
      if (!futuristicSoundPlayed) {
        futuristicSoundPlayed = true;
        scheduleFuturisticSounds();
      }
    }).catch(() => {
      console.log('Audio playback requires user interaction');
    });
  } else {
    futuristicSoundPlayed = true;
    scheduleFuturisticSounds();
  }
  
  function scheduleFuturisticSounds() {
    const now = audioContext.currentTime;
    
    // Ascending tone sweep
    const sweep1 = audioContext.createOscillator();
    const sweep1Gain = audioContext.createGain();
    sweep1.type = 'sine';
    sweep1.frequency.setValueAtTime(200, now);
    sweep1.frequency.exponentialRampToValueAtTime(800, now + 0.8);
    sweep1Gain.gain.setValueAtTime(0.3, now);
    sweep1Gain.gain.exponentialRampToValueAtTime(0, now + 0.8);
    sweep1.connect(sweep1Gain);
    sweep1Gain.connect(audioContext.destination);
    sweep1.start(now);
    sweep1.stop(now + 0.8);
    
    // Scanning beep pattern
    function createBeep(startTime, freq, duration) {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    }
    
    createBeep(now + 1, 1000, 0.3);
    createBeep(now + 1.4, 1200, 0.3);
    createBeep(now + 1.8, 1400, 0.3);
    
    // Power-up whoosh
    const whoosh = audioContext.createBufferSource();
    const whooshBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.3, audioContext.sampleRate);
    const whooshData = whooshBuffer.getChannelData(0);
    for (let i = 0; i < whooshBuffer.length; i++) {
      whooshData[i] = (Math.random() - 0.5) * 2;
    }
    whoosh.buffer = whooshBuffer;
    
    const whooshFilter = audioContext.createBiquadFilter();
    whooshFilter.type = 'highpass';
    whooshFilter.frequency.setValueAtTime(200, now + 2.4);
    whooshFilter.frequency.exponentialRampToValueAtTime(6000, now + 2.7);
    
    const whooshGain = audioContext.createGain();
    whooshGain.gain.setValueAtTime(0.3, now + 2.4);
    whooshGain.gain.exponentialRampToValueAtTime(0, now + 2.7);
    
    whoosh.connect(whooshFilter);
    whooshFilter.connect(whooshGain);
    whooshGain.connect(audioContext.destination);
    whoosh.start(now + 2.4);
    whoosh.stop(now + 2.7);
  }
}

function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 6 + 's';
    particle.style.animationDuration = (4 + Math.random() * 4) + 's';
    container.appendChild(particle);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  createParticles();
  
  const enableAudio = () => {
    playFuturisticSound();
  };
  
  document.addEventListener('click', enableAudio, { once: true });
  document.addEventListener('touchstart', enableAudio, { once: true });
  document.addEventListener('keydown', enableAudio, { once: true });
  
  setTimeout(() => {
    const futuristicIntro = document.getElementById('futuristicIntro');
    if (futuristicIntro) {
      futuristicIntro.remove();
    }
  }, 4000);
});

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

let clockMode = localStorage.getItem('clockMode') || 'digital';

function updateTime() {
  const now = new Date();
  
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}:${seconds}`;
  
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateString = now.toLocaleDateString('en-US', options);
  
  document.getElementById('time').textContent = timeString;
  document.getElementById('date').textContent = dateString;
  
  if (document.getElementById('analogDate')) {
    document.getElementById('analogDate').textContent = dateString;
  }
  
  if (document.getElementById('pixelTime')) {
    document.getElementById('pixelTime').textContent = timeString;
  }
  
  if (document.getElementById('pixelDate')) {
    document.getElementById('pixelDate').textContent = dateString;
  }
  
  const hoursNum = now.getHours() % 12;
  const minutesNum = now.getMinutes();
  const secondsNum = now.getSeconds();
  
  const hourDeg = (hoursNum * 30) + (minutesNum * 0.5);
  const minuteDeg = minutesNum * 6;
  const secondDeg = secondsNum * 6;
  
  const hourHand = document.getElementById('hourHand');
  const minuteHand = document.getElementById('minuteHand');
  const secondHand = document.getElementById('secondHand');
  
  if (hourHand) hourHand.style.transform = `rotate(${hourDeg}deg)`;
  if (minuteHand) minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
  if (secondHand) secondHand.style.transform = `rotate(${secondDeg}deg)`;
}

function switchClockMode(mode) {
  clockMode = mode;
  localStorage.setItem('clockMode', clockMode);
  
  const clockDigital = document.getElementById('clockDigital');
  const clockAnalog = document.getElementById('clockAnalog');
  const clockPixel = document.getElementById('clockPixel');
  
  clockDigital.style.display = 'none';
  clockAnalog.style.display = 'none';
  clockPixel.style.display = 'none';
  
  if (mode === 'digital') {
    clockDigital.style.display = 'block';
  } else if (mode === 'analog') {
    clockAnalog.style.display = 'flex';
  } else if (mode === 'pixel') {
    clockPixel.style.display = 'flex';
  }
  
  updateTime();
}

document.getElementById('timeContainer').addEventListener('click', () => {
  if (clockMode === 'digital') {
    switchClockMode('analog');
  } else if (clockMode === 'analog') {
    switchClockMode('pixel');
  } else {
    switchClockMode('digital');
  }
});

switchClockMode(clockMode);
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

const engineIcons = document.querySelectorAll('.engine-icon');
const searchInput = document.getElementById('searchInput');

function updateSearchEngine(engine) {
  currentSearchEngine = engine;
  localStorage.setItem('searchEngine', currentSearchEngine);
  
  engineIcons.forEach(icon => {
    icon.classList.remove('active');
    if (icon.dataset.engine === engine) {
      icon.classList.add('active');
    }
  });
  
  const engineNames = {
    google: 'Google',
    bing: 'Bing',
    duckduckgo: 'DuckDuckGo',
    yahoo: 'Yahoo',
    yandex: 'Yandex'
  };
  
  searchInput.placeholder = `Search with ${engineNames[engine]}...`;
}

engineIcons.forEach(icon => {
  icon.addEventListener('click', () => {
    updateSearchEngine(icon.dataset.engine);
  });
});

updateSearchEngine(currentSearchEngine);

document.getElementById('searchForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
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

document.getElementById('profileImageUpload').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target.result;
      const preview = document.getElementById('uploadPreview');
      preview.innerHTML = `<img src="${imageUrl}" alt="Preview">`;
      document.getElementById('profileImageUrl').value = imageUrl;
    };
    reader.readAsDataURL(file);
  }
});

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

// Background wallpaper loading commented out due to CORS restrictions
// async function loadBackgroundWallpaper() {
//   try {
//     const response = await fetch('https://source.unsplash.com/random/1920x1080/?nature,landscape');
//     const imageUrl = response.url;
//     
//     const overlay = document.getElementById('backgroundOverlay');
//     overlay.style.backgroundImage = `url(${imageUrl})`;
//     
//     localStorage.setItem('lastWallpaper', imageUrl);
//   } catch (error) {
//     console.error('Failed to load wallpaper:', error);
//   }
// }

// const savedWallpaper = localStorage.getItem('lastWallpaper');
// if (savedWallpaper) {
//   document.getElementById('backgroundOverlay').style.backgroundImage = `url(${savedWallpaper})`;
// } else {
//   loadBackgroundWallpaper();
// }


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

let isTesting = false;

async function measurePing() {
  const pingUrl = 'https://www.cloudflare.com/cdn-cgi/trace';
  const iterations = 5;
  let totalPing = 0;
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    await fetch(pingUrl, { 
      method: 'GET', 
      cache: 'no-store',
      mode: 'cors'
    });
    const endTime = performance.now();
    totalPing += (endTime - startTime);
  }
  
  return (totalPing / iterations).toFixed(1);
}

async function measureDownload() {
  const downloadUrl = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js';
  const iterations = 3;
  let totalSpeed = 0;
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    const response = await fetch(downloadUrl + '?t=' + Date.now(), {
      cache: 'no-store',
      mode: 'cors'
    });
    const blob = await response.blob();
    const endTime = performance.now();
    
    const durationInSeconds = (endTime - startTime) / 1000;
    const bitsLoaded = blob.size * 8;
    const speedBps = bitsLoaded / durationInSeconds;
    const speedMbps = speedBps / (1024 * 1024);
    
    totalSpeed += speedMbps;
  }
  
  return (totalSpeed / iterations).toFixed(2);
}

async function measureUpload() {
  const uploadUrl = 'https://httpbin.org/post';
  const uploadSize = 500 * 1024;
  const iterations = 2;
  let totalSpeed = 0;
  
  const data = new ArrayBuffer(uploadSize);
  const blob = new Blob([data]);
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    try {
      await fetch(uploadUrl, {
        method: 'POST',
        body: blob,
        cache: 'no-store',
        mode: 'cors'
      });
      const endTime = performance.now();
      
      const durationInSeconds = (endTime - startTime) / 1000;
      const bitsUploaded = uploadSize * 8;
      const speedBps = bitsUploaded / durationInSeconds;
      const speedMbps = speedBps / (1024 * 1024);
      
      totalSpeed += speedMbps;
    } catch (error) {
      console.error('Upload test error:', error);
      return 0;
    }
  }
  
  return (totalSpeed / iterations).toFixed(2);
}

async function runSpeedTest() {
  if (isTesting) return;
  
  isTesting = true;
  const pingValue = document.getElementById('pingValue');
  const downloadValue = document.getElementById('downloadValue');
  const uploadValue = document.getElementById('uploadValue');
  const pingFill = document.getElementById('pingFill');
  const downloadFill = document.getElementById('downloadFill');
  const uploadFill = document.getElementById('uploadFill');
  const speedStatus = document.getElementById('speedStatus');
  const speedBtn = document.getElementById('speedTestBtn');
  
  speedBtn.disabled = true;
  speedBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Testing...</span>';
  
  pingValue.textContent = '--';
  downloadValue.textContent = '--';
  uploadValue.textContent = '--';
  pingFill.style.width = '0%';
  downloadFill.style.width = '0%';
  uploadFill.style.width = '0%';
  
  try {
    speedStatus.textContent = 'Measuring ping...';
    const ping = await measurePing();
    pingValue.textContent = ping;
    const pingPercentage = Math.max(0, Math.min(100, 100 - (parseFloat(ping) / 2)));
    pingFill.style.width = `${pingPercentage}%`;
    
    speedStatus.textContent = 'Measuring download speed...';
    const download = await measureDownload();
    downloadValue.textContent = download;
    const downloadPercentage = Math.min((parseFloat(download) / 100) * 100, 100);
    downloadFill.style.width = `${downloadPercentage}%`;
    
    speedStatus.textContent = 'Measuring upload speed...';
    const upload = await measureUpload();
    uploadValue.textContent = upload;
    const uploadPercentage = Math.min((parseFloat(upload) / 50) * 100, 100);
    uploadFill.style.width = `${uploadPercentage}%`;
    
    speedStatus.textContent = 'Test completed successfully!';
    
  } catch (error) {
    pingValue.textContent = '--';
    downloadValue.textContent = '--';
    uploadValue.textContent = '--';
    pingFill.style.width = '0%';
    downloadFill.style.width = '0%';
    uploadFill.style.width = '0%';
    speedStatus.textContent = 'Test failed. Please try again.';
    console.error('Speed test error:', error);
  } finally {
    isTesting = false;
    speedBtn.disabled = false;
    speedBtn.innerHTML = '<i class="fas fa-redo"></i><span>Run Again</span>';
  }
}

document.getElementById('speedTestBtn').addEventListener('click', runSpeedTest);
