///public/js/components/modal.js
function setupThemeToggle(buttonId, iconId, textId) {
    const themeToggle = document.getElementById(buttonId);
    const themeIcon = document.getElementById(iconId);
    const themeText = document.getElementById(textId);

    themeToggle.addEventListener('click', () => {
        const darkMode = document.documentElement.classList.toggle('dark');
        themeIcon.textContent = darkMode ? '🌙' : '☀️';
        themeText.textContent = darkMode ? 'Modo Escuro' : 'Modo Claro';
    });
}
