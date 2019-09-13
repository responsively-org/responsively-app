<?php
      
   //error_reporting(-1);
   //ini_set('display_errors', 'On');

  // Include the MailChimp API wrapper
  // https://github.com/drewm/mailchimp-api
	include('vendor/drewm/MailChimp.php');
	use \DrewM\MailChimp\MailChimp;
  $MailChimp = new MailChimp($apiKey);

  // Set up response object to be returned to browser as JSON
  $response = (object) array('status' => '', 'message' => $successMessage);

  // If the form has been submitted with a captcha, verify it - if it fails from Google,
  // exit the script after returning an error message.
  if(isset($_POST['g-recaptcha-response'])){
    require('include/recaptcha_v2.php');
  }

  // Make sure there are no blank fields which will cause an error in MailChimp
  foreach ($mergeFields as $key => $value)
  {
    if(empty($value)){
        $mergeFields[$key] = ' '; 
    }
  }

  // Check if email is subscribed to the list already
  $subscriber_hash = $MailChimp->subscriberHash($_POST[$emailField]);
  $result = $MailChimp->get("lists/$listId/members/$subscriber_hash");
  // Check result of MailChimp operation
	if ($MailChimp->success()) {
    // Success message
    $response->status = "success";
    if(json_decode($MailChimp->getLastResponse()['body'])->status === 'subscribed'){
      $response->message = $alreadySubscribed;
    }
    if(json_decode($MailChimp->getLastResponse()['body'])->status === 'pending'){
      $response->message = $checkConfirmation;
    }
    echo json_encode($response);
    exit;
	} else {
    // If not found in list, it is 404 and the script should continue else, show the error.
    if(json_decode($MailChimp->getLastResponse()['body'])->status !== 404){
      handle_error($MailChimp);
    }
  }

	// Submit subscriber data to MailChimp
	// For parameters doc, refer to: http://developer.mailchimp.com/documentation/mailchimp/reference/lists/members/
	// For wrapper's doc, visit: https://github.com/drewm/mailchimp-api
	$result = $MailChimp->post("lists/$listId/members", [
    'email_address' => $_POST[$emailField],
    'mergeFields'  => $mergeFields,
    'status'        => $status,
  ]);

  // Check result of MailChimp operation
	if ($MailChimp->success()) {
		// Success message
    $response->status = "success";
    $response->message = $successMessage;
	} else {
		// Display error
	  handle_error($MailChimp);
  }
  echo json_encode($response);
  exit;

  function handle_error($MailChimp) {
    $response->status = "error";
    $response->message = $MailChimp->getLastError();
    $response->errorDetail = $MailChimp->getLastResponse()['body'];
    $response->errorName = 'MailChimp subscribe error';
    echo json_encode($response);
    exit;
  }


?>
