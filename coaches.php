
<?php
require_once ("../connectsodb.php");
require_once  ("checksession.php"); //Check to make sure user is logged in and has privileges

//text output
$output ="<div>";

$query = "SELECT * FROM `coaches`";
//$output .=$query;
$result = $mysqlConn->query($query) or print("\n<br />Warning: query failed:$query. " . $mysqlConn->error. ". At file:". __FILE__ ." by " . $_SERVER['REMOTE_ADDR'] .".");

if($result)
{
	while ($row = $result->fetch_assoc()):
		$output .="<div>";
		$output .="<hr><h2>".$row['first']." ".$row['last']."</h2>";
		if($row['position'])
		{
			$output .="<div>".$row['position']."</div>";
		}
		if($row['emailSchool'])
		{
			$output .="<div>Email:".$row['email']."</div>";
		}
	endwhile;
	$output .="</div>";
}
echo $output;
?>
