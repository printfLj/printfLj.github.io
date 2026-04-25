// Typing Animation
const typingText = document.getElementById('typing-text');
const skills = [
    "Cybersecurity Enthusiast",
    "Blue Team Operations | Threat Hunting",
    "Digital Forensics | Log Analysis",
    "CTF Competitor | Network Security"
];

let skillIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeWriter() {
    const currentSkill = skills[skillIndex];
    
    if (!isDeleting) {
        typingText.textContent = currentSkill.substring(0, charIndex + 1);
        charIndex++;
        
        if (charIndex === currentSkill.length) {
            isDeleting = true;
            setTimeout(typeWriter, 2000); // Pause before deleting
            return;
        }
    } else {
        typingText.textContent = currentSkill.substring(0, charIndex - 1);
        charIndex--;
        
        if (charIndex === 0) {
            isDeleting = false;
            skillIndex = (skillIndex + 1) % skills.length;
        }
    }
    
    setTimeout(typeWriter, isDeleting ? 50 : 100);
}

// Start typing animation
setTimeout(typeWriter, 1000);

// Fade-in Animation on Scroll
const sections = document.querySelectorAll('.section');

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

sections.forEach(section => {
    observer.observe(section);
});

// Smooth Scrolling for Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar Background Change on Scroll
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 100) {
        navbar.style.backgroundColor = 'rgba(10, 10, 10, 0.95)';
    } else {
        navbar.style.backgroundColor = 'rgba(10, 10, 10, 0.9)';
    }
});

// Add some playful effects
document.addEventListener('DOMContentLoaded', () => {
    // Add cursor trail effect (subtle)
    const cursor = document.createElement('div');
    cursor.style.position = 'fixed';
    cursor.style.width = '10px';
    cursor.style.height = '10px';
    cursor.style.backgroundColor = '#00ff00';
    cursor.style.borderRadius = '50%';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '9999';
    cursor.style.opacity = '0.5';
    cursor.style.transition = 'all 0.1s ease';
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX - 5 + 'px';
        cursor.style.top = e.clientY - 5 + 'px';
    });

    const contactForm = document.querySelector('.contact-form');
    const contactError = document.getElementById('contact-error');

    // Rate limiting and security functions
    function sanitizeInput(value) {
        // Remove HTML tags, script content, and other dangerous characters
        return value
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/[<>]/g, '') // Remove angle brackets
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+\s*=/gi, '') // Remove event handlers
            .trim();
    }

    function getRateLimitData() {
        const data = localStorage.getItem('contactFormData');
        return data ? JSON.parse(data) : { submissions: [], totalCount: 0 };
    }

    function updateRateLimitData(success = false) {
        const data = getRateLimitData();
        const now = Date.now();
        
        // Clean old submissions (older than 1 hour)
        data.submissions = data.submissions.filter(time => now - time < 3600000);
        
        if (success) {
            data.submissions.push(now);
            data.totalCount += 1;
        }
        
        localStorage.setItem('contactFormData', JSON.stringify(data));
        return data;
    }

    function checkRateLimit() {
        const data = getRateLimitData();
        const now = Date.now();
        
        // Clean old submissions
        data.submissions = data.submissions.filter(time => now - time < 3600000);
        
        // Check hourly limit (3 submissions per hour)
        if (data.submissions.length >= 3) {
            return { allowed: false, reason: 'rate_limit', remainingTime: Math.ceil((3600000 - (now - data.submissions[0])) / 60000) };
        }
        
        // Check total limit (150 submissions total)
        if (data.totalCount >= 150) {
            return { allowed: false, reason: 'total_limit' };
        }
        
        return { allowed: true };
    }

    if (contactForm && contactError) {
        // Initialize EmailJS with your public key
        emailjs.init('rl5PHJ2rCHgHcIyh6');

        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            contactError.textContent = '';
            contactError.classList.remove('success');

            const formData = new FormData(contactForm);
            const email = sanitizeInput((formData.get('email') || '').toString().trim());
            const message = sanitizeInput((formData.get('message') || '').toString().trim());
            const honeypot = (formData.get('website') || '').toString().trim();
            const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
            const errors = [];

            // Bot detection - honeypot
            if (honeypot) {
                return; // Silently ignore bot submissions
            }

            // Check rate limits
            const rateCheck = checkRateLimit();
            if (!rateCheck.allowed) {
                if (rateCheck.reason === 'rate_limit') {
                    errors.push(`Too many messages. Please wait ${rateCheck.remainingTime} minutes before sending another message.`);
                } else if (rateCheck.reason === 'total_limit') {
                    errors.push('Message limit reached. The contact form is currently unavailable. Please email directly at lancejoseph.devera9@gmail.com');
                }
                contactError.textContent = errors.join(' ');
                return;
            }

            // Enhanced email validation
            if (!email) {
                errors.push('Please enter your email address.');
            } else if (!emailPattern.test(email)) {
                errors.push('Please enter a valid email address.');
            } else if (email.length > 254) { // RFC 5321 limit
                errors.push('Email address is too long.');
            }

            // Enhanced message validation
            if (!message) {
                errors.push('Please enter a message.');
            } else {
                if (message.length < 10) {
                    errors.push('Message must be at least 10 characters.');
                }
                if (message.length > 1000) {
                    errors.push('Message must be 1000 characters or less.');
                }
                // Check for suspicious content
                if (message.includes('http://') || message.includes('https://')) {
                    errors.push('Links are not allowed in messages.');
                }
            }

            if (errors.length) {
                contactError.textContent = errors.join(' ');
                return;
            }

            // Prepare email data
            const templateParams = {
                from_email: email,
                message: message,
                to_email: 'lancejoseph.devera9@gmail.com'
            };

            // Update UI for sending
            contactError.textContent = 'Sending message...';
            contactError.classList.add('success');
            contactForm.querySelector('button[type="submit"]').disabled = true;

            // Send email using EmailJS
            emailjs.send('service_3uclfpj', 'template_fh47hgy', templateParams)
                .then((response) => {
                    // Success - update rate limiting data
                    updateRateLimitData(true);
                    
                    contactError.textContent = 'Message sent successfully! Thank you for reaching out.';
                    contactForm.reset();
                    contactForm.querySelector('button[type="submit"]').disabled = false;
                    
                    // Clear success message after 5 seconds
                    setTimeout(() => {
                        contactError.textContent = '';
                        contactError.classList.remove('success');
                    }, 5000);
                })
                .catch((error) => {
                    contactError.textContent = 'Failed to send message. Please try again or email directly at lancejoseph.devera9@gmail.com';
                    contactError.classList.remove('success');
                    contactForm.querySelector('button[type="submit"]').disabled = false;
                });
        });
    }
});