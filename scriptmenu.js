//Fonctions pour le menu
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
