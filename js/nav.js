/* js/nav.js */

// Automatically highlight the current page in the navbar
document.addEventListener('DOMContentLoaded', () => {
    // Get the current page URL (e.g., "courses.html")
    const currentPage = window.location.pathname.split("/").pop();

    // Select all nav links
    const navLinks = document.querySelectorAll('.nav-links li a');

    navLinks.forEach(link => {
        // Get the link's href (e.g., "courses.html")
        const linkPage = link.getAttribute('href');

        // If the link matches the current page, add 'active' class
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            // Remove active from others (except if it's the home page and path is empty)
            if (currentPage !== "" && linkPage !== "index.html") {
                 link.classList.remove('active');
            }
        }
    });
});