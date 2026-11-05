import { animate, inView } from "https://cdn.jsdelivr.net/npm/motion@12/+esm";

animate("h1", { opacity: [0, 1], y: [20, 0] }, { duration: 0.6 });


inView("section", (element) => {
    animate(element, { opacity: [0, 1], y: [40, 0] }, { duration: 0.8 });
});