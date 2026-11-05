// Motion is loaded by a <script> tag in index.html, which provides the global "Motion".
const { animate, inView, scroll } = Motion;

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
    const link = document.querySelector(`.top-nav a[href="#${section.id}"]`);
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
const projectsSection = document.querySelector(".projects");
const projectsTrack = document.querySelector(".projects-track");
let stopProjectsScroll = null;

function setUpProjectsScroll() {
    if (stopProjectsScroll) stopProjectsScroll();
    projectsTrack.style.transform = "none";

    const distance = Math.max(0, projectsTrack.scrollWidth - window.innerWidth);

    // One pixel of vertical scrolling moves the cards one pixel sideways.
    projectsSection.style.height = `${window.innerHeight + distance}px`;

    // progress goes from 0 (section just pinned to the top of the window)
    // to 1 (section about to un-pin); the cards move left in step with it.
    stopProjectsScroll = scroll(
        (progress) => {
            projectsTrack.style.transform = `translateX(${-progress * distance}px)`;
        },
        { target: projectsSection, offset: ["start start", "end end"] }
    );
}

setUpProjectsScroll();

// Re-measure when the window is resized.
let resizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setUpProjectsScroll, 150);
});
