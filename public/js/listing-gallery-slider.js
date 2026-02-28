(() => {
    "use strict";

    const galleries = document.querySelectorAll("[data-gallery-slider]");
    if (!galleries.length) return;

    galleries.forEach((gallery) => {
        const track = gallery.querySelector("[data-gallery-track]");
        const prev = gallery.querySelector("[data-gallery-prev]");
        const next = gallery.querySelector("[data-gallery-next]");

        if (!track || !prev || !next) return;

        const getStep = () => Math.max(track.clientWidth * 0.9, 240);
        const updateButtons = () => {
            const maxScrollLeft = track.scrollWidth - track.clientWidth - 2;
            prev.disabled = track.scrollLeft <= 1;
            next.disabled = track.scrollLeft >= maxScrollLeft;
        };

        prev.addEventListener("click", () => {
            track.scrollBy({ left: -getStep(), behavior: "smooth" });
        });

        next.addEventListener("click", () => {
            track.scrollBy({ left: getStep(), behavior: "smooth" });
        });

        track.addEventListener("scroll", updateButtons, { passive: true });
        window.addEventListener("resize", updateButtons);
        updateButtons();
    });
})();
