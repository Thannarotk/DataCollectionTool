<?php
  include "db_connect.php";
  $BD_name = $_POST["input-name"];
  $BD_gid = $_POST["input-bid"];
  $layer_geom = $_POST['input-geom'];
  $BD_type = $_POST["input-occupancy-conditon"];
  $BD_stories =  $_POST["input-story"];
  $BD_pop = $_POST["input-pop"];
  $status_id = $_POST["input-status"];
  $layer_type = $_POST["input-typelayer"];
  if($layer_type === "marker"){
    $sql = "INSERT INTO point_building (name, type, geom, no_story, status)
            VALUES ('".$BD_name."', '".$BD_type."', ST_SetSRID(ST_GeomFromText('".$layer_geom."'),4326), ".$BD_stories.", ".$status_id.");";
  }else{
    $sql = "INSERT INTO polygon_building (name, type, geom, no_story, status)
            VALUES ('".$BD_name."', '".$BD_type."', ST_SetSRID(ST_GeomFromText('".$layer_geom."'),4326), ".$BD_stories.", ".$status_id.");";
  }
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
