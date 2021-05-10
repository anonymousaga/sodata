<?php
require_once  ("../connectsodb.php");
require_once  ("checksession.php"); //Check to make sure user is logged in and has privileges


//get list of events
$query = "SELECT * FROM `eventyear` INNER JOIN `event` ON `eventyear`.`eventID`=`event`.`eventID` ORDER BY `eventyear`.`year` DESC, `event`.`event` ASC";// where `field` = $fieldId";
$resultEventsList = $mysqlConn->query($query) or print("\n<br />Warning: query failed:$query. " . $mysqlConn->error. ". At file:". __FILE__ ." by " . $_SERVER['REMOTE_ADDR'] .".");
$events ="<div id='eventsListDiv'><label for='eventsList'>Event</label> ";
$events .="<select id='eventsList'>";
	if($resultEventsList)
	{
		while ($rowEvents = $resultEventsList->fetch_assoc()):
			$events .= "<option value='" . $rowEvents['eventyearID'] . "'>" . $rowEvents['year'] . " " . $rowEvents['event'] . "</option>";
		endwhile;
	}
	$events.="</select></div>";
echo $events;
?>
