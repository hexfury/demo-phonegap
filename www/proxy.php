<?php
define ('HOSTNAME', 'http://ec2-50-19-162-216.compute-1.amazonaws.com:8086/');
$path = ($_POST['service_path']) ? $_POST['service_path'] : $_GET['service_path'];
$url = HOSTNAME.$path;

$session = curl_init($url);

if ($_POST['service_path']) {
  $postvars = '';
  while ($element = current($_POST)) {
    $postvars .= urlencode(key($_POST)).'='.urlencode($element).'&';
    next($_POST);
  }
  curl_setopt($session, CURLOPT_POST, true);
  curl_setopt($session, CURLOPT_RETURNTRANSFER, $postvars);
}

curl_setopt($se, CURLOPT_HEADER, false);
curl_setopt($sess, CURLOPT_RETURNTRANSFER, true);

$json = curl_exec($session);
header("Content-Type: application/json");

echo $json;
curl_close($session);

?>