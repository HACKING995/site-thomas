const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour servir des fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Simuler des données de statistiques
const stats = {
    dailyVisits: 120,
    weeklyVisits: 750,
    monthlyVisits: 3000,
    totalUsers: 1500,
};

// Route pour obtenir les statistiques
app.get('/api/stats', (req, res) => {
    res.json(stats);
});

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
