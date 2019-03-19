<?php
include "db_connect.php";
$result = $pdo->query("SELECT *, ST_AsGeoJSON(geom, 5) AS geojson FROM point_building");
//echo $result->rowCount();
$features=[];
foreach ($result as $row) {
  unset($row['geom']);
  $geometry = $row['geojson']=json_decode($row['geojson']);
  unset($row['geojson']);
  $feature = ["type"=>"Feature" , "geometry"=>$geometry,"properties"=>$row];
  array_push($features, $feature);
}
$featureCollection = ["type"=>"FeatureCollection", "features"=>$features];
array_walk_recursive($featureCollection, function (&$item, $key) {
    $item = null === $item ? '' : $item;
});
echo json_encode($featureCollection);
?>
