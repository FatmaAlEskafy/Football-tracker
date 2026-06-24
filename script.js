// ===================================
// FOOTBALL MATCH SCHEDULE TRACKER
// ===================================

// Local Storage Key
const STORAGE_KEY = 'matchTrackerData';

// Sample FIFA Club World Cup 2026 Matches (Realistic Schedule)
const SAMPLE_MATCHES = [
    {
        id: 1,
        teamA: 'Real Madrid',
        teamB: 'Al-Hilal',
        date: '2026-06-15',
        time: '14:30',
        stadium: 'King Fahd International Stadium',
        group: 'Semifinal',
        status: 'upcoming',
        watched: false,
        favorite: false,
    },
    {
        id: 2,
        teamA: 'Manchester City',
        teamB: 'Fluminense',
        date: '2026-06-16',
        time: '18:00',
        stadium: 'King Fahd International Stadium',
        group: 'Semifinal',
        status: 'upcoming',
        watched: false,
        favorite: false,
    },
    {
        id: 3,
        teamA: 'Bayern Munich',
        teamB: 'Palmeiras',
        date: '2026-06-18',
        time: '15:00',
        stadium: 'Princess Nora University Stadium',
        group: 'Quarterfinal',
        status: 'upcoming',
        watched: false,
        favorite: false,
    },
    {
        id: 4,
        teamA: 'Inter Miami',
        teamB: 'Monterrey',
        date: '2026-06-17',
        time: '16:30',
        stadium: 'King Fahd International Stadium',
        group: 'Group Stage',
        status: 'upcoming',
        watched: false,
        favorite: false,
    },
    {
        id: 5,
        teamA: 'Liverpool',
        teamB: 'AS Roma',
        date: '2026-06-14',
        time: '19:00',
        stadium: 'Princess Nora University Stadium',
        group: 'Group Stage',
        status: 'finished',
        watched: true,
        favorite: true,
    },
    {
        id: 6,
        teamA: 'Paris Saint-Germain',
        teamB: 'Benfica',
        date: '2026-06-19',
        time: '17:00',
        stadium: 'King Fahd International Stadium',
        group: 'Group Stage',
        status: 'upcoming',
        watched: false,
        favorite: false,
    },
];

// ===================================
// STATE MANAGEMENT
// ===================================

let matches = [];
let currentFilter = 'all';
let currentSearchQuery = '';

// Initialize the app
function initializeApp() {
    loadMatches();
    renderMatches();
    updateStatistics();
    setupEventListeners();
    initializeCountdown();
    setInterval(initializeCountdown, 1000); // Update countdown every second
}

// ===================================
// LOCAL STORAGE FUNCTIONS
// ===================================

function loadMatches() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        matches = JSON.parse(stored);
    } else {
        // First time - load sample matches
        matches = JSON.parse(JSON.stringify(SAMPLE_MATCHES));
        saveMatches();
    }
}

function saveMatches() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
}

// ===================================
// EVENT LISTENERS SETUP
// ===================================

function setupEventListeners() {
    // Tab Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', switchTab);
    });

    // Filter Buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilterClick);
    });

    // Search Input
    document.getElementById('searchInput').addEventListener('input', handleSearch);

    // Add Match Form
    document.getElementById('addMatchForm').addEventListener('submit', handleAddMatch);

    // Edit Match Form
    document.getElementById('editMatchForm').addEventListener('submit', handleEditMatch);

    // Modal Controls
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelEdit').addEventListener('click', closeModal);

    // Close modal when clicking outside
    document.getElementById('editModal').addEventListener('click', (e) => {
        if (e.target.id === 'editModal') closeModal();
    });
}

// ===================================
// TAB SWITCHING
// ===================================

function switchTab(e) {
    const tabName = e.target.closest('.nav-btn').dataset.tab;

    // Update active button
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    e.target.closest('.nav-btn').classList.add('active');

    // Update active tab
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
}

// ===================================
// FILTER & SEARCH
// ===================================

function handleFilterClick(e) {
    const filterBtn = e.target.closest('.filter-btn');
    currentFilter = filterBtn.dataset.filter;

    // Update button styles
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    filterBtn.classList.add('active');

    renderMatches();
}

function handleSearch(e) {
    currentSearchQuery = e.target.value.toLowerCase();
    renderMatches();
}

function filterMatches() {
    let filtered = matches;

    // Filter by status
    if (currentFilter !== 'all') {
        if (currentFilter === 'watched') {
            filtered = filtered.filter(m => m.watched);
        } else {
            filtered = filtered.filter(m => m.status === currentFilter);
        }
    }

    // Filter by search query
    if (currentSearchQuery) {
        filtered = filtered.filter(m =>
            m.teamA.toLowerCase().includes(currentSearchQuery) ||
            m.teamB.toLowerCase().includes(currentSearchQuery)
        );
    }

    return filtered;
}

// ===================================
// RENDER MATCHES
// ===================================

function renderMatches() {
    const filtered = filterMatches();
    const matchesGrid = document.getElementById('matchesGrid');

    if (filtered.length === 0) {
        matchesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>No matches found</p>
            </div>
        `;
        return;
    }

    matchesGrid.innerHTML = filtered.map(match => createMatchCard(match)).join('');

    // Add event listeners to match cards
    document.querySelectorAll('.watch-btn').forEach(btn => {
        btn.addEventListener('click', toggleWatched);
    });

    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', toggleFavorite);
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', openEditModal);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', deleteMatch);
    });
}

function createMatchCard(match) {
    const date = new Date(`${match.date}T${match.time}`);
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const statusClass = `status-${match.status}`;
    const watchedClass = match.watched ? 'active' : '';
    const favoriteClass = match.favorite ? 'active' : '';

    return `
        <div class="match-card">
            <div class="match-header">
                <div class="match-status">
                    <span class="status-badge ${statusClass}">
                        ${match.status}
                    </span>
                    ${match.watched ? '<span class="status-badge status-watched">Watched</span>' : ''}
                </div>
                <div class="match-title">
                    <h3>${match.teamA} vs ${match.teamB}</h3>
                    ${match.group ? `<p class="match-group">${match.group}</p>` : ''}
                </div>
            </div>
            <div class="match-body">
                <div class="teams">
                    <div class="team">
                        <div class="team-logo" title="Team A">
                            ${match.teamA.substring(0, 2).toUpperCase()}
                        </div>
                        <div class="team-name">${match.teamA}</div>
                    </div>
                    <div class="vs">VS</div>
                    <div class="team">
                        <div class="team-logo" title="Team B">
                            ${match.teamB.substring(0, 2).toUpperCase()}
                        </div>
                        <div class="team-name">${match.teamB}</div>
                    </div>
                </div>
                <div class="match-details">
                    <div class="detail-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span class="detail-text">${formattedDate}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-clock"></i>
                        <span class="detail-text">${formattedTime}</span>
                    </div>
                    ${match.stadium ? `
                        <div class="detail-item">
                            <i class="fas fa-stadium"></i>
                            <span class="detail-text">${match.stadium}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="match-footer">
                <button class="btn btn-secondary watch-btn ${watchedClass}" data-id="${match.id}" title="Mark as watched">
                    <i class="fas fa-eye"></i>
                    <span>Watch</span>
                </button>
                <button class="btn btn-secondary favorite-btn ${favoriteClass}" data-id="${match.id}" title="Add to favorites">
                    <i class="fas fa-heart"></i>
                </button>
                <button class="btn btn-secondary edit-btn" data-id="${match.id}" title="Edit match">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger delete-btn" data-id="${match.id}" title="Delete match">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// ===================================
// MATCH ACTIONS
// ===================================

function toggleWatched(e) {
    const matchId = parseInt(e.currentTarget.dataset.id);
    const match = matches.find(m => m.id === matchId);
    if (match) {
        match.watched = !match.watched;
        saveMatches();
        renderMatches();
        updateStatistics();
        renderFavorites();
    }
}

function toggleFavorite(e) {
    const matchId = parseInt(e.currentTarget.dataset.id);
    const match = matches.find(m => m.id === matchId);
    if (match) {
        match.favorite = !match.favorite;
        saveMatches();
        renderMatches();
        updateStatistics();
        renderFavorites();
    }
}

function deleteMatch(e) {
    const matchId = parseInt(e.currentTarget.dataset.id);
    if (confirm('Are you sure you want to delete this match?')) {
        matches = matches.filter(m => m.id !== matchId);
        saveMatches();
        renderMatches();
        updateStatistics();
        renderFavorites();
    }
}

function openEditModal(e) {
    const matchId = parseInt(e.currentTarget.dataset.id);
    const match = matches.find(m => m.id === matchId);

    if (match) {
        document.getElementById('editMatchId').value = match.id;
        document.getElementById('editTeamA').value = match.teamA;
        document.getElementById('editTeamB').value = match.teamB;
        document.getElementById('editMatchDate').value = match.date;
        document.getElementById('editMatchTime').value = match.time;
        document.getElementById('editStadium').value = match.stadium || '';
        document.getElementById('editGroup').value = match.group || '';
        document.getElementById('editStatus').value = match.status;

        document.getElementById('editModal').classList.add('active');
    }
}

function closeModal() {
    document.getElementById('editModal').classList.remove('active');
    document.getElementById('editMatchForm').reset();
}

// ===================================
// FORM HANDLING
// ===================================

function handleAddMatch(e) {
    e.preventDefault();

    const newMatch = {
        id: Date.now(),
        teamA: document.getElementById('teamA').value,
        teamB: document.getElementById('teamB').value,
        date: document.getElementById('matchDate').value,
        time: document.getElementById('matchTime').value,
        stadium: document.getElementById('stadium').value,
        group: document.getElementById('group').value,
        status: document.getElementById('status').value,
        watched: false,
        favorite: false,
    };

    matches.push(newMatch);
    saveMatches();
    document.getElementById('addMatchForm').reset();

    // Show success message
    showNotification('Match added successfully!');

    // Switch to matches tab
    const matchesTab = document.querySelector('[data-tab="matches"]');
    matchesTab.click();

    renderMatches();
    updateStatistics();
}

function handleEditMatch(e) {
    e.preventDefault();

    const matchId = parseInt(document.getElementById('editMatchId').value);
    const match = matches.find(m => m.id === matchId);

    if (match) {
        match.teamA = document.getElementById('editTeamA').value;
        match.teamB = document.getElementById('editTeamB').value;
        match.date = document.getElementById('editMatchDate').value;
        match.time = document.getElementById('editMatchTime').value;
        match.stadium = document.getElementById('editStadium').value;
        match.group = document.getElementById('editGroup').value;
        match.status = document.getElementById('editStatus').value;

        saveMatches();
        closeModal();
        renderMatches();
        updateStatistics();
        renderFavorites();
        showNotification('Match updated successfully!');
    }
}

// ===================================
// STATISTICS
// ===================================

function updateStatistics() {
    const total = matches.length;
    const upcoming = matches.filter(m => m.status === 'upcoming').length;
    const watched = matches.filter(m => m.watched).length;
    const percentage = total > 0 ? Math.round((watched / total) * 100) : 0;

    document.getElementById('totalMatches').textContent = total;
    document.getElementById('upcomingCount').textContent = upcoming;
    document.getElementById('watchedCount').textContent = watched;
    document.getElementById('watchedPercentage').textContent = percentage + '%';
}

// ===================================
// COUNTDOWN TIMER
// ===================================

function initializeCountdown() {
    const upcomingMatches = matches
        .filter(m => m.status === 'upcoming')
        .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        });

    const countdownCard = document.getElementById('countdownCard');

    if (upcomingMatches.length === 0) {
        countdownCard.innerHTML = `
            <div class="countdown-placeholder">
                <i class="fas fa-search"></i>
                <p>No upcoming matches</p>
            </div>
        `;
        return;
    }

    const nextMatch = upcomingMatches[0];
    const matchDateTime = new Date(`${nextMatch.date}T${nextMatch.time}`);
    const now = new Date();
    const timeLeft = matchDateTime - now;

    if (timeLeft <= 0) {
        countdownCard.innerHTML = `
            <div class="countdown-placeholder">
                <i class="fas fa-hourglass-end"></i>
                <p>Match has started or finished</p>
            </div>
        `;
        return;
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    const matchDate = matchDateTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const matchTime = matchDateTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    countdownCard.innerHTML = `
        <div class="countdown-content">
            <div class="match-info">
                <div class="match-teams">
                    <div class="team-logo">${nextMatch.teamA.substring(0, 2).toUpperCase()}</div>
                    <span>${nextMatch.teamA} vs ${nextMatch.teamB}</span>
                    <div class="team-logo">${nextMatch.teamB.substring(0, 2).toUpperCase()}</div>
                </div>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">
                    ${matchDate} at ${matchTime}
                </p>
            </div>
            <div class="countdown-timer">
                <div class="countdown-unit">
                    <div class="countdown-number">${String(days).padStart(2, '0')}</div>
                    <div class="countdown-label">Days</div>
                </div>
                <div class="countdown-unit">
                    <div class="countdown-number">${String(hours).padStart(2, '0')}</div>
                    <div class="countdown-label">Hours</div>
                </div>
                <div class="countdown-unit">
                    <div class="countdown-number">${String(minutes).padStart(2, '0')}</div>
                    <div class="countdown-label">Minutes</div>
                </div>
                <div class="countdown-unit">
                    <div class="countdown-number">${String(seconds).padStart(2, '0')}</div>
                    <div class="countdown-label">Seconds</div>
                </div>
            </div>
        </div>
    `;
}

// ===================================
// FAVORITES
// ===================================

function renderFavorites() {
    const favorites = matches.filter(m => m.favorite);
    const favoritesGrid = document.getElementById('favoritesGrid');

    if (favorites.length === 0) {
        favoritesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-star"></i>
                <p>No favorite matches yet</p>
            </div>
        `;
        return;
    }

    favoritesGrid.innerHTML = favorites.map(match => createMatchCard(match)).join('');

    // Add event listeners to match cards
    document.querySelectorAll('.watch-btn').forEach(btn => {
        btn.addEventListener('click', toggleWatched);
    });

    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', toggleFavorite);
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', openEditModal);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', deleteMatch);
    });
}

// ===================================
// NOTIFICATIONS
// ===================================

function showNotification(message) {
    // Simple notification using alert - can be enhanced with toast notifications
    console.log('✓ ' + message);

    // Create a temporary notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--accent);
        color: var(--primary);
        padding: 12px 24px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 9999;
        animation: slideIn 0.3s ease-in-out;
    `;
    notification.textContent = '✓ ' + message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', initializeApp);
