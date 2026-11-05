// Motion is loaded by a <script> tag in index.html, which provides the global "Motion".
const { animate, inView, scroll } = Motion;

/* ---------- Light / dark mode ---------- */
// The button swaps data-theme on <html>; style.css changes every colour from that.
// The choice is remembered for the next visit.
const themeToggle = document.querySelector(".theme-toggle");

function updateThemeButton() {
    const light = document.documentElement.dataset.theme === "light";
    themeToggle.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
}

themeToggle.addEventListener("click", () => {
    const light = document.documentElement.dataset.theme !== "light";
    if (light) document.documentElement.dataset.theme = "light";
    else delete document.documentElement.dataset.theme;
    try { localStorage.setItem("theme", light ? "light" : "dark"); } catch (e) {}
    updateThemeButton();
    animate(themeToggle, { rotate: [0, 360] }, { duration: 0.5, ease: "easeOut" });
});

updateThemeButton();

/* ---------- 1. Intro ---------- */
// Fade the greeting in when the page loads.
animate(".hero h1", { opacity: [0, 1], y: [20, 0] }, { duration: 0.6 });

// As the intro scrolls away, the image drifts left and the text drifts right.
const hero = document.querySelector(".hero");

const heroImg = document.querySelector(".hero img");
const heroText = document.querySelector(".hero .greeting");

// progress goes from 0 (page at the top) to 1 (intro fully scrolled out of view).
scroll(
    (progress) => {
        heroImg.style.transform = `translateX(${-150 * progress}px)`;
        heroText.style.transform = `translateX(${150 * progress}px)`;
        heroImg.style.opacity = heroText.style.opacity = 1 - progress;
    },
    { target: hero, offset: ["start start", "end start"] }
);

/* ---------- 2 & 4. About and Contact ---------- */
// Fade each section in the first time it comes into view.
inView(".reveal", (element) => {
    animate(element, { opacity: [0, 1], y: [40, 0] }, { duration: 0.8 });
});

/* ---------- Navigation: highlight the current section ---------- */
// A section counts as "current" while it crosses the middle line of the window.
// (This also works for the tall Projects section.)
document.querySelectorAll("section[id]").forEach((section) => {
    const link = document.querySelector(`.top-nav ul a[href="#${section.id}"]`);
    if (!link) return;

    inView(section, () => {
        link.classList.add("active");
        return () => link.classList.remove("active");   // runs when the section leaves
    }, { margin: "-50% 0px -50% 0px" });
});

/* ---------- Scroll progress bar ---------- */
// progress goes from 0 at the top of the page to 1 at the bottom.
const progressBar = document.querySelector(".progress-bar");
scroll((progress) => {
    progressBar.style.transform = `scaleX(${progress})`;
});

/* ---------- 3. Projects: horizontal scroll ---------- */
// While you scroll down through the Projects section, the row of cards slides left
// until the last card is in view. The slide distance is measured from the real width
// of the cards, so you can change card sizes or the gap in CSS freely.
const projectsScroller = document.querySelector(".projects-scroller");
const projectsTrack = document.querySelector(".projects-track");
let stopProjectsScroll = null;

// Same width as the phone rules in style.css
const phoneLayout = window.matchMedia("(max-width: 700px)");

// Give every project title the same height (the tallest title's), so the
// pictures underneath all line up.
function equaliseProjectTitles() {
    const titles = document.querySelectorAll(".project-card h3");
    titles.forEach((t) => (t.style.minHeight = ""));
    if (phoneLayout.matches) return;   // stacked vertically on phones, no need
    const tallest = Math.max(...[...titles].map((t) => t.offsetHeight));
    titles.forEach((t) => (t.style.minHeight = `${tallest}px`));
}

function setUpProjectsScroll() {
    equaliseProjectTitles();
    if (stopProjectsScroll) stopProjectsScroll();
    stopProjectsScroll = null;
    projectsTrack.style.transform = "none";

    // On phones the cards are stacked vertically, so there's nothing to slide.
    if (phoneLayout.matches) {
        projectsScroller.style.height = "";
        return;
    }

    const distance = Math.max(0, projectsTrack.scrollWidth - window.innerWidth);

    // The pinned area is the window minus the nav bar. Adding the slide distance
    // means one pixel of vertical scrolling moves the cards one pixel sideways.
    const sticky = document.querySelector(".projects-sticky");
    const pinTop = parseFloat(getComputedStyle(sticky).top);   // where the cards pin (below the nav bar)
    const pinnedHeight = sticky.offsetHeight;
    projectsScroller.style.height = `${pinnedHeight + distance}px`;

    // progress goes from 0 (cards just pinned under the nav bar)
    // to 1 (about to un-pin); the cards move left in step with it.
    stopProjectsScroll = scroll(
        (progress) => {
            projectsTrack.style.transform = `translateX(${-progress * distance}px)`;
        },
        {
            target: projectsScroller,
            offset: [`start ${pinTop}px`, "end end"],
        }
    );
}

setUpProjectsScroll();

// Re-measure when the window is resized.
let resizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setUpProjectsScroll, 150);
});

/* ---------- Project pop-up ---------- */
// "Read more" copies that card's content into the pop-up and animates it open.
// Anything inside .project-details only shows up here, not on the card.
const modal = document.querySelector(".project-modal");
const modalContent = modal.querySelector(".modal-content");
let modalClosing = false;

function openProject(card) {
    modalContent.innerHTML = "";
    for (const child of card.children) {
        if (child.classList.contains("project-footer")) continue;   // no "Read more" in the pop-up
        const copy = child.cloneNode(true);
        copy.style.minHeight = "";   // drop the equal-title-height setting
        modalContent.appendChild(copy);
    }
    modal.showModal();
    modal.scrollTop = 0;
    animate(
        modal,
        { opacity: [0, 1], scale: [0.9, 1], y: [40, 0] },
        { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
    );
}

function closeProject() {
    if (modalClosing || !modal.open) return;
    modalClosing = true;
    animate(modal, { opacity: 0, scale: 0.95, y: 20 }, { duration: 0.2, ease: "easeIn" })
        .then(() => {
            modal.close();
            modalClosing = false;
        });
}

document.querySelectorAll(".expand-btn").forEach((button) => {
    button.addEventListener("click", () => openProject(button.closest(".project-card")));
});

modal.querySelector(".modal-close").addEventListener("click", closeProject);

// Clicking the dark area outside the pop-up closes it
modal.addEventListener("click", (event) => {
    if (event.target === modal) closeProject();
});

// The Esc key closes it too, with the same animation
modal.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeProject();
});
