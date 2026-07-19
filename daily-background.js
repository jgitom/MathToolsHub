(() => {
    "use strict";

    const THEMES = ["ocean", "violet", "forest", "sunset", "rose"];
    let midnightTimer;

    function localDayNumber(date) {
        return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
    }

    function applyDailyBackground() {
        const today = new Date();
        const themeIndex = ((localDayNumber(today) % THEMES.length) + THEMES.length) % THEMES.length;
        const root = document.documentElement;
        root.dataset.dailyBackground = String(themeIndex);
        root.dataset.dailyTheme = THEMES[themeIndex];

        const nextMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        window.clearTimeout(midnightTimer);
        midnightTimer = window.setTimeout(applyDailyBackground, nextMidnight.getTime() - Date.now() + 100);
    }

    applyDailyBackground();
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) applyDailyBackground();
    });
})();
