<?php

/****************************************************************************/
/*                                                                          */
/* YOU MAY WISH TO MODIFY OR REMOVE THE FOLLOWING LINES WHICH SET DEFAULTS  */
/*                                                                          */
/****************************************************************************/

$preferences = Swift_Preferences::getInstance();

// Sets the default charset so that setCharset() is not needed elsewhere
$preferences->setCharset('utf-8');

// Without these lines the default caching mechanism is "array" but this uses a lot of memory.
// If possible, use a disk cache to enable attaching large attachments etc.
// You can override the default temporary directory by setting the TMPDIR environment variable.

// The @ operator in front of is_writable calls is to avoid PHP warnings
// when using open_basedir
$tmp = getenv('TMPDIR');
if ($tmp && @is_writable($tmp)) {
    $preferences
        ->setTempDir($tmp)
        ->setCacheType('disk');
} elseif (function_exists('sys_get_temp_dir') && @is_writable(sys_get_temp_dir())) {
    $preferences
        ->setTempDir(sys_get_temp_dir())
        ->setCacheType('disk');
}

// this should only be done when Swiftmailer won't use the native QP content encoder
// see mime_deps.php
if (version_compare(phpversion(), '5.4.7', '<')) {
    $preferences->setQPDotEscape(false);
}
