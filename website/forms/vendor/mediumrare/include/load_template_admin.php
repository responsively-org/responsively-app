<?php

// Get Basic HTML template for sending email with user's input.
$pathToTemplate = 'templates/'.$adminEmailTemplate;

set_error_handler(
    function ($severity, $message, $file, $line) {
        $response->status = 'error';
                  $response->message = 'Failed to open admin email template file. Email to admin was not sent. Error message:'.$message;
        echo(json_encode($response));
        exit;
    }
);

try{
    $adminEmailTemplate = file_get_contents($pathToTemplate);
} catch (Exception $err) {
    exit;
}

$postValues = array_values($_POST);
// Take all Post array keys and 
$postKeys = array_map(function($value) {return '[['.$value.']]';}, array_keys($_POST));

$htmlContent = str_replace($postKeys, $postValues, $adminEmailTemplate);

