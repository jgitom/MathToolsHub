(() => {
    "use strict";

    const THEMES = [
        "ocean", "violet", "forest", "sunset", "rose", "aurora", "lagoon",
        "sapphire", "orchid", "citrus", "coral", "evergreen", "starlight", "sabah"
    ];
    let rotationTimer;

    function localDayNumber(date) {
        return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
    }

    function applyRotatingBackground() {
        const now = new Date();
        const halfDayNumber = (localDayNumber(now) * 2) + (now.getHours() >= 12 ? 1 : 0);
        const themeIndex = ((halfDayNumber % THEMES.length) + THEMES.length) % THEMES.length;
        const root = document.documentElement;
        root.dataset.dailyBackground = String(themeIndex);
        root.dataset.dailyTheme = THEMES[themeIndex];

        const nextChange = now.getHours() < 12
            ? new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12)
            : new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        window.clearTimeout(rotationTimer);
        rotationTimer = window.setTimeout(applyRotatingBackground, nextChange.getTime() - Date.now() + 100);
    }

    applyRotatingBackground();
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) applyRotatingBackground();
    });
})();
