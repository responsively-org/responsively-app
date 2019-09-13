<?php

// If the form has been submitted with a captcha, check it - if it fails from Google, exit the script after returning an error message.

  $data = array(
          'secret' => $recaptchaSecretKey,
          'response' => $_POST['g-recaptcha-response']
      );

  $verify = curl_init();
  curl_setopt($verify, CURLOPT_URL, "https://www.google.com/recaptcha/api/siteverify");
  curl_setopt($verify, CURLOPT_POST, true);
  curl_setopt($verify, CURLOPT_POSTFIELDS, http_build_query($data));
  curl_setopt($verify, CURLOPT_SSL_VERIFYPEER, false);
  curl_setopt($verify, CURLOPT_RETURNTRANSFER, true);
  $gResponse = curl_exec($verify);

  $gResponse = json_decode( $gResponse , true );

  if($gResponse['success'] == false)
  {
      $response->status = "error";
      $response->message = $recaptchaErrorMessage;
      $response->errorDetail = json_encode($gResponse);
      $response->errorName = 'Google reCAPTCHA verification error';
      echo(json_encode($response));
      exit;
  }else{
    $response->recaptchaDetail = $gResponse;
    unset($_POST['g-recaptcha-response']);
  }


?>
