//
//
// form-email.js
//
// Handles validation and sending email contact forms

import jQuery from 'jquery';
import mrUtil from './util';
import mrRecaptchav2 from './recaptcha-v2';

const mrFormEmail = (($) => {
  // Check mrUtil is present and correct version
  if (!(mrUtil && mrUtil.version >= '1.2.0')) {
    throw new Error('mrUtil >= version 1.2.0 is required.');
  }

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */

  const NAME = 'mrFormEmail';
  const VERSION = '1.0.0';
  const DATA_KEY = 'mr.formEmail';
  const EVENT_KEY = `.${DATA_KEY}`;
  const DATA_API_KEY = '.data-api';
  const JQUERY_NO_CONFLICT = $.fn[NAME];

  const ClassName = {
    LOADING: 'btn-loading-animate',
    WAS_VALIDATED: 'was-validated',
    D_NONE: 'd-none',
  };

  const Attribute = {
    ACTION: 'action',
    DISABLED: 'disabled',
    FEEDBACK_DELAY: 'data-feedback-delay',
    SUCCESS_REDIRECT: 'data-success-redirect',
  };

  const Selector = {
    DATA_ATTR: 'form-email',
    DATA_FORM_EMAIL: '[data-form-email]',
    DATA_SUCCESS: '[data-success-message]',
    DATA_ERROR: '[data-error-message]',
    SUBMIT_BUTTON: 'button[type="submit"]',
    SPAN: 'span',
    ALL_INPUTS: 'input,textarea,select',
  };

  const Event = {
    SENT: `sent${EVENT_KEY}`,
    LOAD_DATA_API: `load${EVENT_KEY}${DATA_API_KEY}`,
    SUBMIT: 'submit',
  };

  const Options = {
    LOADING_TEXT: 'data-loading-text',
  };

  const Default = {
    LOADING_TEXT: 'Sending',
    FORM_ACTION: 'forms/mail.php',
    FEEDBACK_DELAY: 5000,
    ERROR_TEXT: 'Form submission error',
  };

  const Status = {
    SUCCESS: 'success',
    ERROR: 'error',
  };

  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */

  class FormEmail {
    constructor(element) {
      this.form = element;
      this.action = this.form.getAttribute(Attribute.ACTION) || Default.FORM_ACTION;
      // Returns an object containing the feedback
      this.feedback = this.getFeedbackElements();
      // Get any recaptcha instances in the form - returns array of instances or null
      this.getRecaptcha();
      // Get submit button, inner span and loading text.
      this.initSubmitButton();
      // const $element = $(element);
      this.setSubmitEvent();
    }

    // getters

    static get VERSION() {
      return VERSION;
    }

    submitForm() {
      // Hide feedback mesages for fresh submit
      this.hideAllFeedback();
      // Submit form if validateForm returns true
      if (this.validateForm()) {
        this.ajaxSubmit();
      }
    }

    validateForm() {
      let formIsValid = this.form.checkValidity();

      if (this.recaptcha) {
        if (this.recaptcha.invisible) {
          if (formIsValid && !this.recaptcha.checkValidity()) {
            this.recaptcha.execute();
            return false;
          }
        // invalidate if captcha is found and is not valid, otherwise keep original value
        } else if (this.recaptcha.checkValidity() === false) {
          formIsValid = false;
        }
      }
      if (!formIsValid) {
        // Cancel timeout so error message will stay shown
        clearTimeout(this.feedbackTimeout);
        // Allow BS validation styles to take effect
        this.form.classList.add(ClassName.WAS_VALIDATED);
        this.showFeedback(Status.ERROR, this.validationErrorMessage);
        return false;
      }
      this.form.classList.remove(ClassName.WAS_VALIDATED);
      return true;
    }

    ajaxSubmit() {
      const $form = $(this.form);
      const formData = $form.serializeArray();
      formData.push({ name: 'url', value: window.location.href });
      jQuery.ajax({
        context: this,
        data: formData,
        dataType: 'json',
        error: this.showFeedback,
        success: this.processResponse,
        type: 'POST',
        url: this.action,
      });
      this.toggleFormLoading(true);
    }

    initSubmitButton() {
      if (!this.submitButton) {
        this.submitButton = this.form.querySelector(Selector.SUBMIT_BUTTON);
      }
      this.submitButtonSpan = this.submitButton.querySelector(Selector.SPAN);
      this.loadingText = this.submitButton.getAttribute(Options.LOADING_TEXT)
        || Default.LOADING_TEXT;
      this.originalSubmitText = this.submitButtonSpan.textContent;
      return this.submitButton;
    }

    processResponse(response) {
      const success = response.status === Status.SUCCESS;
      // Form is no longer in a 'loading' state
      this.toggleFormLoading(false);
      // Recaptcha will need to be solved again
      if (this.recaptcha) { this.recaptcha.reset(); }
      // Trigger an event so users can fire Analytics scripts upon success
      $(this.form).trigger($.Event(Event.SENT));

      // Redirect upon success if data-attribute is set
      const successRedirect = this.form.getAttribute(Attribute.SUCCESS_REDIRECT);
      if (success && successRedirect && successRedirect !== '') {
        window.location = successRedirect;
      } else if (success) {
        this.form.reset();
        // Hide all feedback and hold a reference to the timeout
        // to cancel it when necessary.
        this.feedbackTimeout = setTimeout(() => this.hideAllFeedback(), this.feedbackDelay);
      }
      //  Show ERROR feedback message if not redirecting
      if (!successRedirect) { this.showFeedback(response.status, response.message); }

      // Detailed error message will be shown in Console if provided
      if (response.errorDetail) {
        /* eslint-disable no-console */
        console.error(response.errorName || Default.ERROR_TEXT,
          response.errorDetail.indexOf('{') === 0
            ? JSON.parse(response.errorDetail)
            : response.errorDetail);
        /* eslint-enable no-console */
      }
    }

    showFeedback(status, text, errorHTTP) {
      // Form is no longer in a 'loading' state
      this.toggleFormLoading(false);
      // If this is an ajax error from jQuery, 'status' will be
      // an object with statusText property
      if (typeof status === 'object' && status.statusText) {
        clearTimeout(this.feedbackTimeout);
        this.feedback.error.innerHTML = `${errorHTTP || text}: <em>"${this.action}"</em> (${status.status} ${text})`;
        this.feedback.error.classList.remove(ClassName.D_NONE);
      } else {
        this.feedback[status].innerHTML = text;
        this.feedback[status].classList.remove(ClassName.D_NONE);
      }
    }

    hideAllFeedback() {
      this.feedback.success.classList.add(ClassName.D_NONE);
      this.feedback.error.classList.add(ClassName.D_NONE);
    }

    getFeedbackElements() {
      if (!this.feedback) {
        this.feedback = {
          success: this.form.querySelector(Selector.DATA_SUCCESS),
          error: this.form.querySelector(Selector.DATA_ERROR),
        };
        // Store the error alert's original text to be used as validation error message
        this.validationErrorMessage = this.feedback.error.innerHTML;
        const feedbackDelay = this.form.getAttribute(Attribute.FEEDBACK_DELAY)
          || Default.FEEDBACK_DELAY;
        this.feedbackDelay = parseInt(feedbackDelay, 10);
        this.feedbackTimeout = null;
      }
      return this.feedback;
    }

    getRecaptcha() {
      if (this.form.querySelector(mrUtil.selector.RECAPTCHA)) {
        // Check mrUtil is present and correct version
        if (!(mrRecaptchav2)) {
          throw new Error('mrRecaptcha.js is required to handle the reCAPTCHA element in this form.');
        } else {
          // Returns an array of mrRecaptcha instances or null
          this.recaptcha = mrRecaptchav2.getRecaptchaFromForm(this.form);
        }
      }
    }

    toggleFormLoading(loading) {
      this.toggleSubmitButtonLoading(loading);
      FormEmail.toggleDisabled(this.form.querySelectorAll(Selector.ALL_INPUTS), loading);
    }

    toggleSubmitButtonLoading(loading) {
      this.toggleSubmitButtonText(loading);
      this.toggleSubmitButtonAnimation(loading);
      FormEmail.toggleDisabled(this.submitButton, loading);
    }

    toggleSubmitButtonAnimation(animate) {
      // If animate is true, add the class, else remove it.
      this.submitButton.classList[(animate ? 'add' : 'remove')](ClassName.LOADING);
    }

    toggleSubmitButtonText(loading) {
      // If loading, set text to loading text, else return to original text.
      this.submitButtonSpan.textContent = loading ? this.loadingText : this.originalSubmitText;
    }

    static toggleDisabled(elements, disabled) {
      // If loading, set text to loading text, else return to original text.
      mrUtil.forEach(elements, (index, element) => element[(disabled ? 'setAttribute' : 'removeAttribute')](Attribute.DISABLED, ''));
    }

    static getInstanceFromForm(form) {
      if (mrUtil.isElement(form)) {
        const data = $(form).data(DATA_KEY);
        return data || null;
      }
      throw new TypeError('Form argument passed to getInstanceFromForm is not an element.');
    }

    setSubmitEvent() {
      $(this.form).on(Event.SUBMIT, (event) => {
        event.preventDefault();
        this.submitForm();
      });
    }

    static jQueryInterface() {
      return this.each(function jqEachFormEmail() {
        const $element = $(this);
        let data = $element.data(DATA_KEY);
        if (!data) {
          data = new FormEmail(this);
          $element.data(DATA_KEY, data);
        }
      });
    }
  }

  /**
   * ------------------------------------------------------------------------
   * Initialise by data attribute
   * ------------------------------------------------------------------------
   */

  $(window).on(Event.LOAD_DATA_API, () => {
    const FormEmailElements = $.makeArray($(Selector.DATA_FORM_EMAIL));

    /* eslint-disable no-plusplus */
    for (let i = FormEmailElements.length; i--;) {
      const $FormEmail = $(FormEmailElements[i]);
      FormEmail.jQueryInterface.call($FormEmail, $FormEmail.data());
    }
  });

  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */
  /* eslint-disable no-param-reassign */
  $.fn[NAME] = FormEmail.jQueryInterface;
  $.fn[NAME].Constructor = FormEmail;
  $.fn[NAME].noConflict = function FormEmailNoConflict() {
    $.fn[NAME] = JQUERY_NO_CONFLICT;
    return FormEmail.jQueryInterface;
  };
  /* eslint-enable no-param-reassign */

  return FormEmail;
})(jQuery);

export default mrFormEmail;
