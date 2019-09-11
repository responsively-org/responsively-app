<?php

// Get HTML template to send to User as confirmation.
$pathToTemplate = 'templates/'.$confirmationEmailTemplate;

set_error_handler(
    function ($severity, $message, $file, $line) {
        $response->status = 'error';
        $response->message = 'Failed to open user confirmation email template file. Confirmation was not sent. ';
        echo(json_encode($response));
        exit;
    }
);

try{
    $confirmationEmailTemplate = file_get_contents($pathToTemplate);
} catch (Exception $err) {
    exit;
}

restore_error_handler();


$confirmationHtmlContent = strtr($confirmationEmailTemplate, $confirmationReplacements);
$confirmationTextContent = filter_var($confirmationHtmlContent, FILTER_SANITIZE_STRING);

