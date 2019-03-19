<?php
  include "db_connect.php";
  $BD_name = $_POST["input-name"];
  $BD_gid = $_POST["input-bid"];
  $BD_type = $_POST["input-occupancy-conditon"];
  $BD_stories =  $_POST["input-story"];
  $status_id = $_POST["input-status"];

  $sql = "UPDATE osm_building SET name='".$BD_name."', type='".$BD_type."', no_story= ".$BD_stories.", status=".$status_id. " WHERE gid = ".$BD_gid. ";" ;
  $result = $pdo->query($sql);
  if ($result){
  $array = array(
  'success' => true,
  'msg' => 'succesfully'
  );
  echo json_encode($array);
  header("Location: ../map.html");
}else{
  $array = array(
  'success' => false,
  'msg' => 'not succesfully'
  );
  echo json_encode($array);
  header("Location: ../map.html");
}

?>
