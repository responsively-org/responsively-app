<?php

// Require the Swift Mailer library
require_once 'vendor/swiftmailer/swift_required.php';

$mailer = Swift_Mailer::newInstance($transport);

$fromArray = array($sendingAccountUsername => $confirmationFromName);

$message = Swift_Message::newInstance($confirmationSubject)
  ->setSender(array($sendingAccountUsername => $confirmationFromName))
  ->setFrom($fromArray)
  ->setReplyTo($confirmationReplyTo)
  ->setTo(array($_POST[$userEmailField] => $_POST[$userNameField]))
  ->setBody($confirmationTextContent, 'text/plain')
  ->addPart($confirmationHtmlContent, 'text/html');

// Send the message or catch an error if it occurs.
try{
  $sentMessages = $mailer->send($message);
  $response->status = "success";
} catch(Exception $e){
  $response->status = "error";
  $response->message = $e->getMessage();
  echo(json_encode($response));
}


?>
