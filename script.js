// Interactive portfolio features: navigation, projects, themes, skills, and contact validation.

let savedTheme = 'light';
try {
    savedTheme = localStorage.getItem('portfolio-theme') ?? 'light';
} catch (error) {
    // Storage can be disabled by the browser; the in-page toggle still works.
}
document.documentElement.classList.toggle('dark-theme', savedTheme === 'dark');
document.body.classList.toggle('dark-theme', savedTheme === 'dark');

const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('main section, body > section');

// Smoothly scroll to each section and close the mobile menu after navigation.
navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        navMenu?.classList.remove('active');
        navToggle?.classList.remove('active');
        navToggle?.setAttribute('aria-expanded', 'false');
    });
});

// Highlight the navigation link for the section currently in view.
function updateActiveNavigation() {
    const scrollPosition = window.scrollY + 120;
    let currentSection = sections[0];

    sections.forEach((section) => {
        if (scrollPosition >= section.offsetTop) currentSection = section;
    });

    navLinks.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${currentSection?.id}`;
        link.classList.toggle('active', isActive);
        if (isActive) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
    });
}

window.addEventListener('scroll', updateActiveNavigation, { passive: true });
updateActiveNavigation();

// Filter projects by the selected category and by any matching technology tag.
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const projectCount = document.querySelector('.project-count');
const projectSearch = document.querySelector('#project-search');
let activeCategory = document.querySelector('.filter-btn.active')?.dataset.filter ?? 'all';

function applyFilters() {
    const query = projectSearch?.value.trim().toLowerCase() ?? '';
    let visibleCount = 0;

    projectCards.forEach((card) => {
        const categoryMatches = activeCategory === 'all' || card.dataset.category === activeCategory;
        const tagMatches = !query || Array.from(card.querySelectorAll('.project-tag'))
            .some((tag) => tag.textContent.toLowerCase().includes(query));
        const isVisible = categoryMatches && tagMatches;

        card.hidden = !isVisible;
        if (isVisible) visibleCount += 1;
    });

    if (projectCount) {
        projectCount.textContent = `Showing ${visibleCount} of ${projectCards.length} projects`;
    }
}

filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
        filterButtons.forEach((item) => item.classList.remove('active'));
        button.classList.add('active');
        activeCategory = button.dataset.filter;
        applyFilters();
    });
});

projectSearch?.addEventListener('input', applyFilters);
applyFilters();

// Mobile navigation toggle.
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

navToggle?.addEventListener('click', () => {
    const isOpen = navMenu?.classList.toggle('active') ?? false;
    navToggle.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
});

// Restore and toggle the user's saved color theme.
const themeToggle = document.querySelector('.theme-toggle');

function setTheme(theme) {
    document.documentElement.classList.toggle('dark-theme', theme === 'dark');
    document.body.classList.toggle('dark-theme', theme === 'dark');
    if (!themeToggle) return;
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    themeToggle.textContent = `${nextTheme === 'dark' ? 'Dark' : 'Light'} mode`;
    themeToggle.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
}

setTheme(savedTheme);

themeToggle?.addEventListener('click', () => {
    const nextTheme = document.documentElement.classList.contains('dark-theme') ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
        localStorage.setItem('portfolio-theme', nextTheme);
    } catch (error) {
        // Keep the current theme for this page session if storage is unavailable.
    }
});

// Animate skill bars the first time the skills section enters the viewport.
const skillBars = document.querySelectorAll('.skill-progress');
const skillsSection = document.querySelector('#skills');

function animateSkills() {
    skillBars.forEach((bar) => {
        bar.style.width = bar.style.getPropertyValue('--skill-level');
    });
}

if ('IntersectionObserver' in window && skillsSection) {
    const skillsObserver = new IntersectionObserver((entries, observer) => {
        if (entries.some((entry) => entry.isIntersecting)) {
            animateSkills();
            observer.disconnect();
        }
    }, { threshold: 0.15 });
    skillsObserver.observe(skillsSection);
} else {
    window.addEventListener('scroll', () => {
        if (skillsSection && skillsSection.getBoundingClientRect().top < window.innerHeight) {
            animateSkills();
        }
    }, { passive: true });
}

// Reusable project details panel populated from the selected card.
const projectDialog = document.querySelector('.project-dialog');
const dialogTitle = projectDialog?.querySelector('#dialog-title');
const dialogDescription = projectDialog?.querySelector('.dialog-description');
const dialogTags = projectDialog?.querySelector('.dialog-tags');
const dialogClose = projectDialog?.querySelector('.dialog-close');

function openProjectDetails(card) {
    if (!projectDialog || !dialogTitle || !dialogDescription || !dialogTags) return;
    dialogTitle.textContent = card.querySelector('.project-title')?.textContent ?? 'Project details';
    dialogDescription.textContent = card.querySelector('.project-description')?.textContent ?? '';
    dialogTags.replaceChildren();
    card.querySelectorAll('.project-tag').forEach((tag) => {
        const tagCopy = document.createElement('span');
        tagCopy.className = 'project-tag';
        tagCopy.textContent = tag.textContent;
        dialogTags.appendChild(tagCopy);
    });
    projectDialog.showModal();
}

projectCards.forEach((card) => {
    card.tabIndex = 0;
    card.setAttribute('aria-label', `View details for ${card.querySelector('.project-title')?.textContent ?? 'project'}`);
    card.addEventListener('click', (event) => {
        if (event.target.closest('a[href="#"]')) {
            event.preventDefault();
            openProjectDetails(card);
            return;
        }
        if (event.target.closest('a')) return;
        openProjectDetails(card);
    });
    card.addEventListener('keydown', (event) => {
        if ((event.key === 'Enter' || event.key === ' ') && event.target === card) {
            event.preventDefault();
            openProjectDetails(card);
        }
    });
});

dialogClose?.addEventListener('click', () => projectDialog?.close());
projectDialog?.addEventListener('click', (event) => {
    if (event.target === projectDialog) projectDialog.close();
});

// Contact form validation with live feedback and a 300-character message limit.
const contactForm = document.querySelector('#contact-form');
const nameInput = document.querySelector('#name');
const emailInput = document.querySelector('#email');
const messageInput = document.querySelector('#message');
const messageCounter = document.querySelector('#message-counter');
let successTimer;

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function clearError(input) {
    input.parentElement?.querySelector('.error-message')?.remove();
    input.classList.remove('error');
    input.removeAttribute('aria-invalid');
}

function showError(input, message) {
    clearError(input);
    const error = document.createElement('span');
    error.className = 'error-message';
    error.textContent = message;
    input.classList.add('error');
    input.setAttribute('aria-invalid', 'true');
    input.parentElement?.appendChild(error);
}

function showSuccess(input) {
    clearError(input);
    input.classList.add('success');
}

function validateName() {
    if (nameInput.value.trim().length < 2) {
        showError(nameInput, 'Name must be at least 2 characters.');
        return false;
    }
    showSuccess(nameInput);
    return true;
}

function validateEmail() {
    if (!isValidEmail(emailInput.value)) {
        showError(emailInput, 'Please enter a valid email address.');
        return false;
    }
    showSuccess(emailInput);
    return true;
}

function validateMessage() {
    const length = messageInput.value.trim().length;
    const rawLength = messageInput.value.length;
    if (messageCounter) {
        messageCounter.textContent = `${rawLength} / 300`;
        messageCounter.classList.toggle('error', rawLength > 300);
    }
    if (length < 10) {
        showError(messageInput, 'Message must be at least 10 characters.');
        return false;
    }
    if (rawLength > 300) {
        showError(messageInput, 'Message must be 300 characters or fewer.');
        return false;
    }
    showSuccess(messageInput);
    return true;
}

nameInput?.addEventListener('input', validateName);
emailInput?.addEventListener('input', validateEmail);
messageInput?.addEventListener('input', validateMessage);

contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const nameIsValid = validateName();
    const emailIsValid = validateEmail();
    const messageIsValid = validateMessage();
    const isValid = nameIsValid && emailIsValid && messageIsValid;
    if (!isValid) return;

    contactForm.querySelector('.success-message')?.remove();
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.setAttribute('role', 'status');
    successMessage.textContent = 'Thank you! Your message has been validated successfully.';
    contactForm.appendChild(successMessage);

    window.clearTimeout(successTimer);
    successTimer = window.setTimeout(() => {
        contactForm.reset();
        contactForm.querySelector('.success-message')?.remove();
        [nameInput, emailInput, messageInput].forEach((input) => {
            clearError(input);
            input.classList.remove('success');
        });
        if (messageCounter) {
            messageCounter.textContent = '0 / 300';
            messageCounter.classList.remove('error');
        }
    }, 3000);
});
