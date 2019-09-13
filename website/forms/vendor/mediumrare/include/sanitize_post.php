<?php

// Basic sanitization to remove tags to safeguard email
function util_array_trim(array &$array, $filter = false)
{
    array_walk_recursive($array, function (&$value) use ($filter) {
        $value = trim($value);
        if ($filter) {
            $value = filter_var($value, FILTER_SANITIZE_STRING);
        }
    });

    return $array;
}

$_POST = util_array_trim($_POST, true);
