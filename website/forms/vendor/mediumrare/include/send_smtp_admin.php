<?php

// Require the Swift Mailer library
require_once 'vendor/swiftmailer/swift_required.php';

$transport = Swift_SmtpTransport::newInstance( $outgoingServerAddress, $outgoingServerPort, $outgoingServerSecurity )
  ->setUsername( $sendingAccountUsername )     
  ->setPassword( $sendingAccountPassword );

$mailer = Swift_Mailer::newInstance($transport);

$fromArray = array($sendingAccountUsername => $websiteName);
$sentMessages = 0;

$message = Swift_Message::newInstance($emailSubject)
  ->setSender(array($sendingAccountUsername => $websiteName))
  ->setFrom($fromArray)
  ->setReplyTo($_POST[$userEmailField])
  ->setTo(array($recipientEmail => $recipientName))
  ->setBody($textContent, 'text/plain')
  ->addPart($htmlContent, 'text/html');

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
