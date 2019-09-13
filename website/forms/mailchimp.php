<?php
    // SETTINGS FOR MAILCHIMP SUBSCRIPTION

    // Log in to MailChimp and create an API key under:
    // [ Account ] -> [ Extras ] -> [ API Keys ]
    $apiKey = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX-us8';
    
    // Find your list ID by opening the list in MailChimp, then:
    // [ Settings ] -> [ List name and defaults ]
    $listId = 'abcdefghij';
    
    // Form data to use as email field
    // (The name="..." value from the email field in your HTML form)
    $emailField = 'email';

    // Fields to be submitted to your MailChimp list along with the email address
    // In this example, "NAME" is the field in your MailChimp list, 
    // and $_POST["name"] is the form data from the user to fill that field
    $mergeFields = array( 
      "NAME" => $_POST["name"],
    );

    // What the user's status will be after submitting.
    // Options are 'pending', 'subscribed', 'unsubscribed', 'cleaned'
    // We recommend 'pending' as this will result in the user receiving
    // an opt-in confirmation email from MailChimp.
    // For single opt-in use 'subscribed'.
    $status = 'pending';

    // Text to show user upon successful subscribe operation
    $successMessage = "Thanks for subscribing, please check your inbox for confirmation.";
    
    // Text to show when the user is already subscribed to the list
    $alreadySubscribed = "You are already subscribed to this list.";

    // Text to show when the user is already subscribed to the list
    $checkConfirmation = "Your subscription is pending, check your inbox for a confirmation link.";
    
    // Google reCAPTCHA
    // If your form is configured with a reCAPTCHA widget, this secret key will be used to validate with Google's server.
    $recaptchaSecretKey        = 'insert-your-recaptcha-secret-key-here';
    $recaptchaErrorMessage     = 'There was a problem verifying the Google reCaptcha.  Please try again.';

    require('vendor/mediumrare/mailchimp_subscribe.php');
?>
