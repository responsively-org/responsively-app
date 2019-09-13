<?php

$textContent = "";
// Creating the message text using fields sent through POST
foreach ($_POST as $key => $value)
{
  if($key !== 'g-recaptcha-response' && $key !== 'captcha'){// Sets of checkboxes will be shown as comma-separated values as they are passed in as an array.
      if(is_array($value)){
          $value = implode(', ' , $value);
      }
      $textContent .= ucfirst($key).": ".$value.PHP_EOL;
  }
}

?>
