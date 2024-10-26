<?php
// Récupérer l'adresse IP du visiteur
$ip = $_SERVER['REMOTE_ADDR'];

// Récupérer l'id de l'article
$id_article = htmlspecialchars($_GET['id']);

$page_url = $_SERVER['REQUEST_URI'];
 

// Récupérer la date actuelle
$date_v = date('Y-m-d h-i-s'); 


// Vérifier si l'adresse IP existe déjà dans la table video_vues
$resultat = $bdd->prepare('SELECT * FROM views WHERE ip_user = ? AND id_article = ?');
$resultat->execute(array($ip,$id_article));
if ($resultat->rowCount() == 0) {
    // Si l'adresse IP n'existe pas, l'ajouter à la table avec l'id de l'article
    $ajouter_vue = $bdd->prepare('INSERT INTO views (id_article, ip_user,date_v) VALUES (?,?,?)');
    $ajouter_vue->execute(array($id_article,$ip,$date_v));

    // Incrémenter le compteur de vues pour l'article
    $compter_vues = $bdd->prepare('UPDATE articles SET vues = vues + 1 WHERE id = ?');
    $compter_vues->execute(array($id_article));
} else {
    // Si l'adresse IP existe déjà, ne pas incrémenter le compteur de vues
}
