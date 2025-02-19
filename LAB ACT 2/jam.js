document.addEventListener("DOMContentLoaded", function () {
    const ScrollReveal = window.ScrollReveal;

    // Set up ScrollReveal for multiple elements
    ScrollReveal().reveal('.hero-content', {
        delay: 500,
        origin: 'top',
        distance: '50px',
        opacity: 0,
        duration: 1000
    });

    ScrollReveal().reveal('.service-card', {
        delay: 700,
        origin: 'bottom',
        distance: '50px',
        opacity: 0,
        interval: 200,
        duration: 1000
    });

    ScrollReveal().reveal('.about-content', {
        delay: 500,
        origin: 'left',
        distance: '50px',
        opacity: 0,
        duration: 1000
    });

    // Change background color of header when scrolling past a certain point
    let debounceTimer;
    window.addEventListener('scroll', function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
            const header = document.querySelector('header');
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, 100); // Adjust delay as needed (in milliseconds)
    });

    // Smooth scroll for anchor links
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    if (scrollLinks.length > 0) {
        scrollLinks.forEach(link => {
            link.addEventListener("click", function (e) {
                e.preventDefault();
                const targetId = this.getAttribute("href").substring(1);
                const targetElement = document.getElementById(targetId);

                window.scrollTo({
                    top: targetElement.offsetTop - 50, // Adjusting for header height
                    behavior: "smooth"
                });
            });
        });
    }

    // Handle Service Card Click (Car Cards)
    const carCards = document.querySelectorAll('.service-card');
    carCards.forEach(card => {
        card.addEventListener('click', function () {
            const carName = this.querySelector('h3').innerText; // Get the car name
            alert(`You clicked on the ${carName}!`);
            // You could open a modal, show more details, etc.
        });
    });

    // Handle Contact Us form submission
    const contactForm = document.querySelector('.contact form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault(); // Prevent form from submitting the usual way

            // Get form input values
            const name = document.querySelector('input[type="text"]').value;
            const email = document.querySelector('input[type="email"]').value;
            const message = document.querySelector('textarea').value;

            // Basic validation (optional)
            if (name && email && message) {
                // Show a success message or alert
                alert(`Thank you, ${name}! Your message has been submitted.`);
                
                // Reset the form (optional)
                contactForm.reset();
            } else {
                alert('Please fill out all fields before submitting.');
            }
        });
    }
});
