class VisitorCounter {
    constructor() {
        this.storageKeys = {
            dailyVisits: 'dailyVisits_' + this.getCurrentDate(),
            weeklyVisits: 'weeklyVisits_' + this.getCurrentWeek(),
            monthlyVisits: 'monthlyVisits_' + this.getCurrentMonth(),
            totalUsers: 'totalUsers'
        };
        this.cleanOldData();
        this.initializeCounters();
        
        // Vérifier si l'utilisateur a déjà été compté aujourd'hui
        if (!this.hasVisitedToday()) {
            this.incrementVisits();
            this.markVisitForToday();
        }
    }

    // Vérifier si l'utilisateur a déjà visité aujourd'hui
    hasVisitedToday() {
        const todayKey = 'visited_' + this.getCurrentDate();
        return localStorage.getItem(todayKey) === 'true';
    }

    // Marquer la visite de l'utilisateur pour aujourd'hui
    markVisitForToday() {
        const todayKey = 'visited_' + this.getCurrentDate();
        localStorage.setItem(todayKey, 'true');
        
        // Définir l'expiration à minuit
        const tomorrow = new Date();
        tomorrow.setHours(24, 0, 0, 0);
        const timeUntilMidnight = tomorrow - new Date();
        
        setTimeout(() => {
            localStorage.removeItem(todayKey);
        }, timeUntilMidnight);
    }

    cleanOldData() {
        const currentDate = this.getCurrentDate();
        const currentWeek = this.getCurrentWeek();
        const currentMonth = this.getCurrentMonth();

        Object.keys(localStorage).forEach(key => {
            // Nettoyer les marqueurs de visite des jours précédents
            if (key.startsWith('visited_') && !key.includes(currentDate)) {
                localStorage.removeItem(key);
            }
            // Nettoyer les autres compteurs
            if (key.startsWith('dailyVisits_') && !key.includes(currentDate)) {
                localStorage.removeItem(key);
            }
            if (key.startsWith('weeklyVisits_') && !key.includes(currentWeek)) {
                localStorage.removeItem(key);
            }
            if (key.startsWith('monthlyVisits_') && !key.includes(currentMonth)) {
                localStorage.removeItem(key);
            }
        });
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

    incrementVisits() {
        // Vérifier si c'est un nouvel utilisateur total
        if (!localStorage.getItem('ever_visited')) {
            localStorage.setItem('ever_visited', 'true');
            const totalUsers = parseInt(localStorage.getItem(this.storageKeys.totalUsers) || '0');
            localStorage.setItem(this.storageKeys.totalUsers, (totalUsers + 1).toString());
        }

        // Incrémenter les compteurs quotidien, hebdomadaire et mensuel
        ['dailyVisits', 'weeklyVisits', 'monthlyVisits'].forEach(key => {
            const currentValue = parseInt(localStorage.getItem(this.storageKeys[key]) || '0');
            localStorage.setItem(this.storageKeys[key], (currentValue + 1).toString());
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

// Fonction d'animation des compteurs
function animateNumbers() {
    const visitorCounter = new VisitorCounter();
    const stats = visitorCounter.getStats();
    
    Object.entries(stats).forEach(([id, target]) => {
        let current = 0;
        const element = document.getElementById(id);
        const increment = target / 50;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.round(current).toLocaleString();
        }, 30);
    });
}

// Observer pour l'animation
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumbers();
                observer.unobserve(entry.target);
            }
        });
    });

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        observer.observe(statsSection);
    }
});








;

// Fonctions pour le menu
function toggleMenu() {
    document.getElementById("menuDropdown").classList.toggle("show");
}

function toggleCategories() {
    document.getElementById("categoriesDropdown").classList.toggle("show");
}

// Gestion du clic en dehors du menu
window.onclick = function(event) {
    if (!event.target.matches('.dropdown a')) {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}
