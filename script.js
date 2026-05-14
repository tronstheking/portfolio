document.addEventListener('DOMContentLoaded', () => {

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Reveal on Scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.fade-in-up');
    revealElements.forEach(el => observer.observe(el));

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.padding = '10px 0';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.03)';
        } else {
            navbar.style.padding = '20px 0';
            navbar.style.boxShadow = 'none';
        }
    });

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-links a');

    function openMenu() {
        hamburger.classList.add('active');
        navLinks.classList.add('active');
        document.body.classList.add('no-scroll');
        hamburger.setAttribute('aria-expanded', 'true');
        hamburger.setAttribute('aria-label', 'Cerrar menú');
    }

    function closeMenu() {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.classList.remove('no-scroll');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Abrir menú');
    }

    hamburger.addEventListener('click', () => {
        if (hamburger.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    // Close menu when a link is clicked
    navLinksItems.forEach(item => {
        item.addEventListener('click', () => {
            closeMenu();
        });
    });

    // Close menu on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            closeMenu();
        }
    });

    // Close menu on outside click
    navLinks.addEventListener('click', (e) => {
        if (e.target === navLinks) closeMenu();
    });

    // FIRST CAROUSEL: Selected Projects (Vertical Scroll - No AutoPlay)
    // Auto-play logic removed to allow sticky scroll behavior
    const selectedSlides = document.querySelectorAll('.selected-project-slide');
    if (selectedSlides.length > 0) {
        selectedSlides.forEach(slide => {
            slide.classList.add('active');
            slide.style.display = 'flex';
        });
    }

    // SECOND CAROUSEL: Take a closer look (Auto-Play with Filtering)
    const projectsTrack = document.querySelector('.projects-carousel-track');
    const allProjectSlides = Array.from(document.querySelectorAll('.project-slide')); // Store original
    let visibleSlides = [...allProjectSlides]; // Current operating list
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Controls - re-query as needed or disable if hidden
    const indicators = document.querySelectorAll('.indicator'); // Might not exist if I removed them?

    if (projectsTrack && allProjectSlides.length > 0) {
        let currentSlide = 0;
        let isPlaying = true;
        let autoPlayInterval;
        const autoPlayDelay = 5000;

        // Initialize first slide of visible selection
        function initCarousel() {
            // Hide all
            allProjectSlides.forEach(slide => {
                slide.classList.remove('active');
                slide.style.display = 'none'; // Force hide
            });

            if (visibleSlides.length > 0) {
                // Show first visible
                visibleSlides[0].classList.add('active');
                visibleSlides[0].style.display = 'flex';
                currentSlide = 0;
            }
        }

        // Sliding Background Logic
        const segmentBackground = document.querySelector('.segment-background');

        function updateSegmentBackground(activeBtn) {
            if (!segmentBackground || !activeBtn) return;

            const btnRect = activeBtn.getBoundingClientRect();
            const parentRect = activeBtn.parentElement.getBoundingClientRect();

            segmentBackground.style.width = `${btnRect.width}px`;
            segmentBackground.style.transform = `translateX(${btnRect.left - parentRect.left}px)`;
        }

        // Initialize background position
        if (visibleSlides.length > 0 && filterBtns.length > 0) {
            // Find active button
            const activeBtn = document.querySelector('.filter-btn.active');
            // Wait a tick for layout
            setTimeout(() => updateSegmentBackground(activeBtn), 50);
        }

        // Filtering Logic with Animation
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update Background
                updateSegmentBackground(btn);

                // Remove active class from buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');

                // Update visible slides
                if (filter === 'all') {
                    visibleSlides = [...allProjectSlides];
                } else {
                    visibleSlides = allProjectSlides.filter(slide => {
                        const categories = slide.getAttribute('data-category').split(' ');
                        return categories.includes(filter);
                    });
                }

                // Reset carousel
                initCarousel();
                // If single or empty, maybe stop autoplay?
                if (visibleSlides.length <= 1) stopAutoPlay();
                else startAutoPlay();
            });
        });

        // Update on resize
        window.addEventListener('resize', () => {
            const activeBtn = document.querySelector('.filter-btn.active');
            updateSegmentBackground(activeBtn);
        });

        function showSlide(index) {
            // Hide all visible slides (visually)
            visibleSlides.forEach(slide => {
                slide.classList.remove('active');
                slide.style.display = 'none';
            });

            // Show current target
            if (visibleSlides[index]) {
                visibleSlides[index].classList.add('active');
                visibleSlides[index].style.display = 'flex';
            }
        }

        function nextSlide() {
            if (visibleSlides.length === 0) return;
            currentSlide = (currentSlide + 1) % visibleSlides.length;
            showSlide(currentSlide);
        }

        function prevSlide() {
            if (visibleSlides.length === 0) return;
            currentSlide = (currentSlide - 1 + visibleSlides.length) % visibleSlides.length;
            showSlide(currentSlide);
        }

        function startAutoPlay() {
            if (visibleSlides.length <= 1) return;
            stopAutoPlay();
            isPlaying = true;
            // Update icons if they exist...
            autoPlayInterval = setInterval(nextSlide, autoPlayDelay);
        }

        function stopAutoPlay() {
            isPlaying = false;
            clearInterval(autoPlayInterval);
        }

        // Initialize
        initCarousel();
        startAutoPlay();
    }



    // Carousel Navigation (Apple-style smooth animation)
    const track = document.querySelector('.carousel-track');
    const carouselControls = document.querySelector('.carousel-controls'); // Get the specific controls container
    const prevBtn = carouselControls ? carouselControls.querySelector('.prev-btn') : null;
    const nextBtn = carouselControls ? carouselControls.querySelector('.next-btn') : null;
    const cards = document.querySelectorAll('.carousel-card');

    if (track && prevBtn && nextBtn && cards.length > 0) {
        let currentIndex = 0;
        let isAnimating = false;

        function updateCarousel(smooth = true) {
            const cardWidth = cards[0].offsetWidth;
            const gap = 30;
            const offset = currentIndex * (cardWidth + gap);

            // Use requestAnimationFrame for smoother rendering
            requestAnimationFrame(() => {
                track.style.transform = `translate3d(-${offset}px, 0, 0)`;
            });

            // Disable buttons at boundaries with smooth fade
            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex >= cards.length - 2;

            // Add smooth opacity transition to buttons
            prevBtn.style.transition = 'opacity 0.3s ease';
            nextBtn.style.transition = 'opacity 0.3s ease';

            // Prevent button spamming
            if (smooth) {
                isAnimating = true;
                setTimeout(() => {
                    isAnimating = false;
                }, 800); // Match CSS transition duration
            }
        }

        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0 && !isAnimating) {
                currentIndex--;
                updateCarousel();
            }
        });

        nextBtn.addEventListener('click', () => {
            if (currentIndex < cards.length - 2 && !isAnimating) {
                currentIndex++;
                updateCarousel();
            }
        });

        // Handle window resize for responsive behavior
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                currentIndex = 0; // Reset to start on resize
                updateCarousel(false);
            }, 250);
        });

        // Touch/swipe support for the carousel
        let touchStartX = 0;
        let touchEndX = 0;

        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const delta = touchStartX - touchEndX;
            if (Math.abs(delta) > 50) {
                if (delta > 0 && currentIndex < cards.length - 2 && !isAnimating) {
                    currentIndex++;
                    updateCarousel();
                } else if (delta < 0 && currentIndex > 0 && !isAnimating) {
                    currentIndex--;
                    updateCarousel();
                }
            }
        }, { passive: true });

        // Initialize
        updateCarousel(false);
    }

    // Scroll-Animated Circle Section
    const circleSection = document.querySelector('.circle-section');

    if (circleSection) {
        const observerOptions = {
            threshold: 0.3, // Trigger when 30% visible
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                } else {
                    entry.target.classList.remove('active');
                }
            });
        }, observerOptions);

        observer.observe(circleSection);
    }

    // Stories Carousel Auto-Play
    const storiesTrack = document.querySelector('.features-grid');
    if (storiesTrack) {
        let storyInterval;
        const scrollAmount = 350; // Card width + gap
        const scrollSpeed = 3000; // 3 seconds

        function startStoriesAutoPlay() {
            stopStoriesAutoPlay(); // Clear existing
            storyInterval = setInterval(() => {
                const maxScrollLeft = storiesTrack.scrollWidth - storiesTrack.clientWidth;

                // Check if we are close to the end
                if (storiesTrack.scrollLeft >= maxScrollLeft - 10) {
                    storiesTrack.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    storiesTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                }
            }, scrollSpeed);
        }

        function stopStoriesAutoPlay() {
            if (storyInterval) clearInterval(storyInterval);
        }

        // Start auto-play
        startStoriesAutoPlay();

        // Pause on interactions
        storiesTrack.addEventListener('mouseenter', stopStoriesAutoPlay);
        storiesTrack.addEventListener('mouseleave', startStoriesAutoPlay);
        storiesTrack.addEventListener('touchstart', stopStoriesAutoPlay, { passive: true });
        storiesTrack.addEventListener('touchend', () => {
            setTimeout(startStoriesAutoPlay, 2000);
        }, { passive: true });
    }

    // Bento Grid Spotlight Effect
    const bentoGrid = document.querySelector('.bento-grid');
    const bentoItems = document.querySelectorAll('.bento-item');

    if (bentoGrid) {
        bentoGrid.addEventListener('mousemove', (e) => {
            bentoItems.forEach(item => {
                const rect = item.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                item.style.setProperty('--mouse-x', `${x}px`);
                item.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    }

});
