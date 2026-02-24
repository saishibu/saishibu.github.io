document.addEventListener('DOMContentLoaded', () => {
    // Current year for footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Sticky Navbar Styling on Scroll
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');
    const navItems = document.querySelectorAll('.nav-link');

    mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        // Toggle icon between bars and xmark
        const icon = mobileToggle.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    });

    // Close mobile menu when clicking a link
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = mobileToggle.querySelector('i');
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        });
    });

    // Scroll Reveal Animation via IntersectionObserver
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Stop observing once revealed
                // observer.unobserve(entry.target); 
            }
        });
    }, {
        root: null,
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // Active Navigation Link Update on Scroll
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100; // Offset for sticky header
            const sectionId = current.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector(`.nav-container a[href*=${sectionId}]`)?.classList.add('active');
            } else {
                document.querySelector(`.nav-container a[href*=${sectionId}]`)?.classList.remove('active');
            }
        });
    });

    // Fetch Latest Medium Article
    async function fetchMediumArticle() {
        const mediumUrl = 'https://blog.saishibu.in/feed';
        const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(mediumUrl)}`;
        const container = document.getElementById('medium-article-content');

        if (!container) return;

        try {
            const response = await fetch(rss2jsonUrl);
            const data = await response.json();

            if (data.status === 'ok' && data.items.length > 0) {
                const latestPost = data.items[0];

                // Extract brief text from content (stripping HTML)
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = latestPost.content || latestPost.description;
                const textContent = tempDiv.textContent || tempDiv.innerText || "";
                const excerpt = textContent.substring(0, 150) + "...";

                // Format Date
                const pubDate = new Date(latestPost.pubDate).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                });

                container.innerHTML = `
                    <p class="article-meta" style="font-size: 0.8rem; color: var(--color-primary); margin-bottom: 0.5rem; font-weight: 600;">${pubDate}</p>
                    <h4 style="font-size: 1.1rem; margin-bottom: 0.75rem; color: var(--color-text);">${latestPost.title}</h4>
                    <p style="font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem; color: var(--color-text-muted);">${excerpt}</p>
                    <a href="${latestPost.link}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">
                        Read on Medium <i class="fa-solid fa-arrow-right" style="margin-left: 8px;"></i>
                    </a>
                `;
            } else {
                throw new Error("No items found");
            }
        } catch (error) {
            console.error("Error fetching Medium article:", error);
            container.innerHTML = `
                <p>I frequently write about Web3, Zero-Knowledge Proofs, and AI. Discover in-depth technical deep dives and architectural patterns on my blog.</p>
                <a href="https://blog.saishibu.in" target="_blank" rel="noopener noreferrer" class="btn btn-secondary mt-4">
                    Visit blog.saishibu.in <i class="fa-solid fa-arrow-right" style="margin-left: 8px;"></i>
                </a>
            `;
        }
    }

    fetchMediumArticle();
});
