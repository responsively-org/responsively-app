<?php

// Save to CSV file
$file = fopen($saveToCSVFileName, 'a');
$data = array_values($_POST);
$data = array_merge(array( date("Y-m-d H:i:s")), $data);

fputcsv_eol($file, $data,"\n");
fclose($file);

function fputcsv_eol($fp, $array, $eol) {
  fputcsv($fp, $array,',', '"');
  if("\n" != $eol && 0 === fseek($fp, -1, SEEK_CUR)) {
    fwrite($fp, $eol);
  }
}
