(() => {
    "use strict";

    const BACKGROUND_COUNT = 6;

    function localDayNumber(date) {
        return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
    }

    function applyDailyBackground() {
        const today = new Date();
        const background = ((localDayNumber(today) % BACKGROUND_COUNT) + BACKGROUND_COUNT) % BACKGROUND_COUNT;
        document.documentElement.dataset.dailyBackground = String(background);

        const nextMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        window.setTimeout(applyDailyBackground, nextMidnight.getTime() - Date.now() + 100);
    }

    applyDailyBackground();
})();
