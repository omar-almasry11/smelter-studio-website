// Multi-Step Form for Client Brief
(function() {
  'use strict';

  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initForm);
  } else {
    initForm();
  }

  function initForm() {
    const form = document.getElementById('clientBriefForm');
    if (!form) return; // Exit if form doesn't exist on page

    const formSteps = document.querySelectorAll('.form-step');
    const nextButtons = document.querySelectorAll('.btn-next');
    const prevButtons = document.querySelectorAll('.btn-prev');
    const submitButton = document.querySelector('.btn-submit');
    const stepIndicators = document.querySelectorAll('.step-indicator');
    const stepLines = document.querySelectorAll('.step-line');
    const stepLabels = document.querySelectorAll('.step-label');
    const successMessage = document.getElementById('successMessage');
    
    let currentStep = 1;
    const totalSteps = formSteps.length;

    // Initialize form - show first step
    showStep(currentStep);

    // Prevent Enter key from submitting form on steps 1 and 2
    form.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.keyCode === 13) {
        const activeStep = document.querySelector('.form-step.active');
        const isLastStep = currentStep === totalSteps;
        
        // If not on the last step, prevent submission and click Next instead
        if (!isLastStep) {
          e.preventDefault();
          
          // Find the Next button in the current step
          const nextButton = activeStep.querySelector('.btn-next');
          if (nextButton) {
            nextButton.click();
          }
        }
        // If on last step, allow Enter to submit (it will hit the validation)
      }
    });

    // Next button click handlers
    nextButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        if (validateStep(currentStep)) {
          currentStep++;
          showStep(currentStep);
          scrollToTop();
        }
      });
    });

    // Previous button click handlers
    prevButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        currentStep--;
        showStep(currentStep);
        scrollToTop();
      });
    });

    // Form submission handler
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!validateStep(currentStep)) {
        return;
      }

      // Disable submit button and show loading state
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.classList.add('loading');
        submitButton.textContent = 'Submitting...';
      }

      // Create FormData object
      const formData = new FormData(form);

      // Submit to Netlify
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      })
      .then(response => {
        if (response.ok) {
          // Hide form and show success message
          form.style.display = 'none';
          if (successMessage) {
            successMessage.classList.remove('hidden');
          }
          scrollToTop();
        } else {
          throw new Error('Form submission failed');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('There was an error submitting your form. Please try again or contact me directly at your@email.com');
        
        // Re-enable submit button
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.classList.remove('loading');
          submitButton.textContent = 'Submit Brief';
        }
      });
    });

    // Show specific step
    function showStep(stepNumber) {
      // Update form steps visibility
      formSteps.forEach((step, index) => {
        if (index + 1 === stepNumber) {
          step.classList.add('active');
        } else {
          step.classList.remove('active');
        }
      });

      // Update progress indicators
      updateProgressIndicators(stepNumber);
    }

    // Update progress indicators (circles and lines)
    function updateProgressIndicators(stepNumber) {
      stepIndicators.forEach((indicator, index) => {
        const step = index + 1;
        
        // Remove all state classes first
        indicator.classList.remove('active', 'completed');
        
        if (step < stepNumber) {
          // Previous steps are completed
          indicator.classList.add('completed');
          if (stepLabels[index]) {
            stepLabels[index].classList.remove('text-normalLight', 'dark:text-invertedLight');
            stepLabels[index].classList.add('text-primary', 'dark:text-primaryInverted');
          }
        } else if (step === stepNumber) {
          // Current step is active
          indicator.classList.add('active');
          if (stepLabels[index]) {
            stepLabels[index].classList.remove('text-normalLight', 'dark:text-invertedLight');
            stepLabels[index].classList.add('text-primary', 'dark:text-primaryInverted');
          }
        } else {
          // Future steps remain default
          if (stepLabels[index]) {
            stepLabels[index].classList.add('text-normalLight', 'dark:text-invertedLight');
            stepLabels[index].classList.remove('text-primary', 'dark:text-primaryInverted');
          }
        }
      });

      // Update progress lines
      stepLines.forEach((line, index) => {
        const lineStep = index + 1;
        if (lineStep < stepNumber) {
          line.classList.add('completed');
        } else {
          line.classList.remove('completed');
        }
      });
    }

    // Validate current step
    function validateStep(stepNumber) {
      const currentStepElement = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
      if (!currentStepElement) return true;

      // Get all required inputs in current step
      const requiredInputs = currentStepElement.querySelectorAll('[required]');
      let isValid = true;
      let firstInvalidField = null;

      requiredInputs.forEach(input => {
        // Remove any previous error styling
        input.classList.remove('border-red-500', 'dark:border-red-400');
        
        // Check if field is empty
        if (!input.value.trim()) {
          isValid = false;
          input.classList.add('border-red-500', 'dark:border-red-400');
          
          if (!firstInvalidField) {
            firstInvalidField = input;
          }
        }

        // Special validation for email
        if (input.type === 'email' && input.value.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(input.value.trim())) {
            isValid = false;
            input.classList.add('border-red-500', 'dark:border-red-400');
            
            if (!firstInvalidField) {
              firstInvalidField = input;
            }
          }
        }
      });

      if (!isValid) {
        // Show error message
        let errorMessage = currentStepElement.querySelector('.error-message');
        if (!errorMessage) {
          errorMessage = document.createElement('div');
          errorMessage.className = 'error-message text-red-600 dark:text-red-400 text-sm mt-2 font-medium';
          errorMessage.textContent = 'Please fill in all required fields correctly.';
          currentStepElement.querySelector('.space-y-6').insertBefore(errorMessage, currentStepElement.querySelector('.space-y-6').firstChild);
        }

        // Focus on first invalid field
        if (firstInvalidField) {
          firstInvalidField.focus();
        }
      } else {
        // Remove error message if exists
        const errorMessage = currentStepElement.querySelector('.error-message');
        if (errorMessage) {
          errorMessage.remove();
        }
      }

      return isValid;
    }

    // Smooth scroll to top of form
    function scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

    // Real-time validation - remove error styling when user starts typing
    const allInputs = form.querySelectorAll('input, textarea');
    allInputs.forEach(input => {
      input.addEventListener('input', function() {
        if (this.classList.contains('border-red-500') || this.classList.contains('dark:border-red-400')) {
          this.classList.remove('border-red-500', 'dark:border-red-400');
          
          // Check if all errors are cleared, remove error message
          const currentStepElement = this.closest('.form-step');
          if (currentStepElement) {
            const hasErrors = currentStepElement.querySelector('.border-red-500, .dark\\:border-red-400');
            if (!hasErrors) {
              const errorMessage = currentStepElement.querySelector('.error-message');
              if (errorMessage) {
                errorMessage.remove();
              }
            }
          }
        }
      });
    });
  }
})();

