<?php

//error_reporting(-1);
//ini_set('display_errors', 'On');

// Basic sanitization to remove tags from user input
require('include/sanitize_post.php');

// Set default timezone as some servers do not have this set.
if(isset($timeZone) && $timeZone != ""){
  date_default_timezone_set($timeZone);
}
else{
  date_default_timezone_set("UTC");
}

// Set up response object to be returned to browser as JSON
$response = (object) array('status' => '', 'message' => $successMessage);

// If the form has been submitted with a captcha, verify it - if it fails from Google,
// exit the script after returning an error message.
if(isset($_POST['g-recaptcha-response'])){
  require('include/recaptcha_v2.php');
}

// Load template and make replacements
require('include/load_template_admin.php');

// Assemble the text for the plain-text version of the message.
require('include/text_content.php');

// Send the email via SMTP using Swiftmailer
require('include/send_smtp_admin.php');

if($saveToCSV === true){
  require('include/save_csv.php');
}

// Send confirmation email to user
if($sendConfirmationToUser === true){
  // Load user confirmation template and makre replacements
  require('include/load_template_user.php');
  // Send the email to the user
  require('include/send_smtp_user.php');
}

echo(json_encode($response));
exit;

?>
