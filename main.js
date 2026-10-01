document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. Mobile Navigation Hamburger Menu Toggle
     ========================================================================== */
  const navContainer = document.querySelector('.nav-container');
  const navLinks = document.querySelector('.nav-links');
  const navActions = document.querySelector('.nav-actions');

  if (navContainer && navLinks) {
    // Dynamically create hamburger button
    const menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.setAttribute('aria-label', 'Toggle Navigation Menu');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.innerHTML = `
      <span class="hamburger-bar"></span>
      <span class="hamburger-bar"></span>
      <span class="hamburger-bar"></span>
    `;

    navContainer.appendChild(menuToggle);

    const closeMenu = () => {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.classList.remove('active');
      navLinks.classList.remove('active');
      if (navActions) navActions.classList.remove('active');
    };

    // Toggle menu state
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      if (navActions) navActions.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
      if (!navContainer.contains(event.target) && navLinks.classList.contains('active')) {
        closeMenu();
      }
    });

    // Close menu on Escape key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        closeMenu();
      }
    });
  }

  /* ==========================================================================
     2. Smooth Scrolling for Internal Navigation Anchors
     ========================================================================== */
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

        // Close mobile menu if open when clicking an anchor link
        const menuToggle = document.querySelector('.menu-toggle');
        if (menuToggle && navLinks && navLinks.classList.contains('active')) {
          menuToggle.setAttribute('aria-expanded', 'false');
          menuToggle.classList.remove('active');
          navLinks.classList.remove('active');
          if (navActions) navActions.classList.remove('active');
        }
      }
    });
  });

  /* ==========================================================================
     3. Generic Form Validation (Excludes AJAX-handled forms)
     ========================================================================== */
  const forms = document.querySelectorAll('form');

  forms.forEach(form => {
    // Skip familyCareForm so the AJAX block below can handle database requests
    if (form.id === 'familyCareForm') return;

    // Reset input borders on user input
    form.querySelectorAll('[required]').forEach(input => {
      input.addEventListener('input', () => {
        input.style.borderColor = '';
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Check for required inputs
      const requiredInputs = form.querySelectorAll('[required]');
      let isValid = true;

      requiredInputs.forEach(input => {
        if (!input.value.trim()) {
          isValid = false;
          input.style.borderColor = 'red';
        } else {
          input.style.borderColor = '';
        }
      });

      if (!isValid) {
        alert('Please complete all required fields before submitting.');
        return;
      }

      // Extract submitter's name if present
      const nameInput = form.querySelector('#fullName') || form.querySelector('#contactPerson') || form.querySelector('input[type="text"]');
      const clientName = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'there';

      // Confirmation Alert
      if (form.id === 'staffingForm') {
        alert(`Thank you, ${clientName}! Your staffing request has been submitted. Our team will review your requirements and get back to you shortly.`);
      } else {
        alert(`Thank you, ${clientName}! Your request has been submitted. Our team will reach out to you shortly.`);
      }

      form.reset();
    });
  });

 /* ==========================================================================
     4. Family Care Request Form (AJAX Processing via PHP)
     ========================================================================== */
  const familyForm = document.getElementById('familyCareForm');

  if (familyForm) {
    // Reset borders on input
    familyForm.querySelectorAll('[required]').forEach(input => {
      input.addEventListener('input', () => {
        input.style.borderColor = '';
      });
    });

    familyForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = familyForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : 'Submit';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'SUBMITTING REQUEST...';
      }

      const formData = new FormData(familyForm);

      try {
        const response = await fetch('process-care.php', {
          method: 'POST',
          body: formData
        });

        const rawText = await response.text();

        // Parse JSON safely
        let data;
        try {
          data = JSON.parse(rawText);
        } catch (jsonErr) {
          console.error('Server returned invalid JSON:', rawText);
          alert('Server Error: The PHP script output an error or unexpected content:\n\n' + rawText.substring(0, 300));
          return;
        }

        if (data.status === 'success') {
          alert(data.message);
          familyForm.reset();
        } else {
          alert('Error: ' + (data.message || 'An error occurred during processing.'));
        }

      } catch (err) {
        console.error('Fetch / Network Error:', err);
        alert('Connection failed: Ensure you are serving files via local server (http://localhost/...) and PHP is running.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
  }
});