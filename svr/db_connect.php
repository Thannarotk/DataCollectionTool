<?php
/* PDO connection start */
try {
$dsn = "pgsql:host=localhost;dbname=postgres;port=5432";
$opt = [
  PDO::ATTR_ERRMODE     => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE  => PDO::FETCH_ASSOC,
  PDO::ATTR_EMULATE_PREPARES   => false
];
$pdo = new PDO($dsn, 'postgres', 'postgres', $opt);
} catch(PDOException $e) {
  //die( 'Database Connection failed: ' . $e->getMessage());
  die;
  echo "ERROR ";
}
/* PDO connection end */
?>
