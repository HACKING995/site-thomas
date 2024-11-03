class VisitorCounter {
    constructor() {
        this.storageKeys = {
            dailyVisits: 'dailyVisits_' + this.getCurrentDate(),
            weeklyVisits: 'weeklyVisits_' + this.getCurrentWeek(),
            monthlyVisits: 'monthlyVisits_' + this.getCurrentMonth(),
            totalUsers: 'totalUsers',
            userIp: 'userIp',
            userCountry: 'userCountry',
            lastVisitIp: 'lastVisitIp_' // Clé pour stocker la date de dernière visite par IP
        };
        this.cleanOldData();
        this.initializeCounters();

        const userId = localStorage.getItem('userId') || this.generateUniqueId();
        localStorage.setItem('userId', userId);
    }

    async fetchUserIp() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('Error fetching IP address:', error);
            return null;
        }
    }

    async fetchUserCountry(ip) {
        try {
            const response = await fetch(`https://ipapi.co/${ip}/json/`);
            const data = await response.json();
            return data.country_name || 'Non défini';
        } catch (error) {
            console.error('Error fetching country:', error);
            return 'Non défini';
        }
    }

    async handleCookieAcceptance() {
        const userIp = await this.fetchUserIp(); // Récupérer l'adresse IP
        const userCountry = await this.fetchUserCountry(userIp); // Récupérer le pays

        if (userIp) {
            localStorage.setItem(this.storageKeys.userIp, userIp);
            document.getElementById('userIp').textContent = userIp; // Afficher l'adresse IP
        }
        
        if (userCountry) {
            localStorage.setItem(this.storageKeys.userCountry, userCountry);
            document.getElementById('userCountry').textContent = userCountry; // Afficher le pays
        }

        this.incrementVisits(userIp); // Mettre à jour les statistiques de visites
    }

    generateUniqueId() {
        return 'user-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }

    incrementVisits(userIp) {
        const lastVisit = localStorage.getItem(this.storageKeys.lastVisitIp + userIp);
        const now = new Date().getTime();

        // Vérifier si 24 heures se sont écoulées
        if (!lastVisit || now - parseInt(lastVisit) >= 24 * 60 * 60 * 1000) {
            localStorage.setItem(this.storageKeys.lastVisitIp + userIp, now.toString());
            const totalUsers = parseInt(localStorage.getItem(this.storageKeys.totalUsers) || '0');
            localStorage.setItem(this.storageKeys.totalUsers, (totalUsers + 1).toString());

            ['dailyVisits', 'weeklyVisits', 'monthlyVisits'].forEach(key => {
                const currentValue = parseInt(localStorage.getItem(this.storageKeys[key]) || '0');
                localStorage.setItem(this.storageKeys[key], (currentValue + 1).toString());
            });
        }
    }

    cleanOldData() {
        const currentDate = this.getCurrentDate();
        const currentWeek = this.getCurrentWeek();
        const currentMonth = this.getCurrentMonth();

        if (localStorage.getItem('lastVisitDate') !== currentDate) {
            localStorage.setItem(this.storageKeys.dailyVisits, '0');
            localStorage.setItem('lastVisitDate', currentDate);
        }
        if (localStorage.getItem('lastVisitWeek') !== currentWeek) {
            localStorage.setItem(this.storageKeys.weeklyVisits, '0');
            localStorage.setItem('lastVisitWeek', currentWeek);
        }
        if (localStorage.getItem('lastVisitMonth') !== currentMonth) {
            localStorage.setItem(this.storageKeys.monthlyVisits, '0');
            localStorage.setItem('lastVisitMonth', currentMonth);
        }
    }

    getCurrentDate() {
        return new Date().toISOString().split('T')[0];
    }

    getCurrentWeek() {
        const date = new Date();
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const weekNumber = Math.ceil((((date - firstDayOfYear) / 86400000) + firstDayOfYear.getDay() + 1) / 7);
        return `${date.getFullYear()}-W${weekNumber}`;
    }

    getCurrentMonth() {
        return new Date().toISOString().slice(0, 7);
    }

    initializeCounters() {
        Object.entries(this.storageKeys).forEach(([key, storageKey]) => {
            if (!localStorage.getItem(storageKey)) {
                localStorage.setItem(storageKey, '0');
            }
        });
    }

    getStats() {
        return {
            dailyVisits: parseInt(localStorage.getItem(this.storageKeys.dailyVisits) || '0'),
            weeklyVisits: parseInt(localStorage.getItem(this.storageKeys.weeklyVisits) || '0'),
            monthlyVisits: parseInt(localStorage.getItem(this.storageKeys.monthlyVisits) || '0'),
            totalUsers: parseInt(localStorage.getItem(this.storageKeys.totalUsers) || '0')
        };
    }
}

// Initialiser le compteur de visiteurs
document.addEventListener('DOMContentLoaded', async () => {
    const visitorCounter = new VisitorCounter();
    
    const stats = visitorCounter.getStats();
    console.log('Statistiques des visiteurs:', stats);

    // Mettre à jour les éléments HTML avec les statistiques initiales
    document.getElementById('dailyVisits').textContent = stats.dailyVisits;
    document.getElementById('weeklyVisits').textContent = stats.weeklyVisits;
    document.getElementById('monthlyVisits').textContent = stats.monthlyVisits;
    document.getElementById('totalUsers').textContent = stats.totalUsers;

    // Afficher l'adresse IP et le pays si déjà stockés
    const userIp = localStorage.getItem(visitorCounter.storageKeys.userIp);
    const userCountry = localStorage.getItem(visitorCounter.storageKeys.userCountry);
    
    if (userIp) {
        document.getElementById('userIp').textContent = userIp; // Afficher l'adresse IP
    }
    
    if (userCountry) {
        document.getElementById('userCountry').textContent = userCountry; // Afficher le pays
    }

    document.getElementById('accept-cookies').onclick = async function() {
        setCookie('cookiesAccepted', 'true', 30); // Cookie valable 30 jours
        await visitorCounter.handleCookieAcceptance(); // Compter la visite
        document.getElementById('cookie-banner').style.display = 'none';

        // Mettre à jour les statistiques après l'acceptation
        const updatedStats = visitorCounter.getStats();
        document.getElementById('dailyVisits').textContent = updatedStats.dailyVisits;
        document.getElementById('weeklyVisits').textContent = updatedStats.weeklyVisits;
        document.getElementById('monthlyVisits').textContent = updatedStats.monthlyVisits;
        document.getElementById('totalUsers').textContent = updatedStats.totalUsers;
    };
});

// Fonction pour créer un cookie
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
}

// Fonction pour lire un cookie
function getCookie(name) {
    return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
}

// Afficher la bannière de cookies
function showCookieBanner() {
    // Toujours afficher la bannière au chargement
    document.getElementById('cookie-banner').style.display = 'block';

    // Vérifier si le cookie d'acceptation existe
    if (getCookie('cookiesAccepted')) {
        document.getElementById('cookie-banner').style.display = 'none';
    }
}

// Appeler la fonction pour afficher la bannière
showCookieBanner();

// Fonction pour mettre à jour la date, l'heure et le jour
function updateDateTime() {
    const now = new Date();

    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('fr-FR', dateOptions);
    document.getElementById('footerDate').textContent = formattedDate;

    const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const formattedTime = now.toLocaleTimeString('fr-FR', timeOptions);
    document.getElementById('footerTime').textContent = formattedTime;

    const dayOptions = { weekday: 'long' };
    const formattedDay = now.toLocaleDateString('fr-FR', dayOptions);
    document.getElementById('footerDay').textContent = formattedDay;
}

// Appeler la fonction pour afficher la date et l'heure au chargement
document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    setInterval(updateDateTime, 1000);
});
