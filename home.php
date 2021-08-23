<?php
require_once ("../connectsodb.php");
require_once ("checksession.php");
require_once("functions.php");
userCheckPrivilege(1);
$output = "";
$studentID = getStudentID($mysqlConn, $_SESSION['userData']['id']);
$currentYear = getCurrentSOYear();
$fallRosterDate = strval(getCurrentSOYear()-1)."-08-01";
if(!empty($_SESSION['userData'])){
  //$output     = '<h2>Google Account Details</h2>';
  $output .= '<div class="ac-data">';
	$output .="<p style=' text-align: center'><img src='images/teamphoto.jpg' alt='team photo' width='600px'><p>";
	$output .= '<p>You are logged in to Walton Science Olympiad Team Website!</p>';
  $output .= '<img src="'.$_SESSION['userData']['picture'].'">';
  //$output .= '<p><b>Google ID:</b> '.$userData['oauth_uid'].'</p>';
  $output .= '<p><b>Name:</b> '.$_SESSION['userData']['first_name'].' '.$_SESSION['userData']['last_name'].'</p>';
  $output .= '<p><b>Email:</b> '.$_SESSION['userData']['email'].'</p>';
  //$output .= '<p><b>Gender:</b> '.$userData['gender'].'</p>';
  //$output .= '<p><b>Locale:</b> '.$userData['locale'].'</p>';

  $output .= "<h2> Quick Links </h2><p>";
  $output .= "<a href='https://drive.google.com/file/d/1IVpuWgh7QzGWutuDaifFNB21zdZWWyYz/view?usp=sharing'> 2022 Draft Rules </a><br>";
  $output .= "<a href='https://docs.google.com/spreadsheets/d/1FY63NJP8GkNXh3gFZy93TNCWz6FdWF_fBpNuHQ4YCYg/edit?usp=sharing'> 2022 Fall Semester Teams </a><br>";
  $output .= "<a href='https://drive.google.com/drive/folders/17LMINQEqhEP3IQzT8jj1-3Iw6gt8boRI?usp=sharing'> Digital Test Bank </a><br>";
  $output .= "<a href='https://calendar.google.com/calendar/u/1?cid=d2FsdG9uc2NpZW5jZWNsdWJAZ21haWwuY29t'> Google Calendar </a></p>";

//TODO: Fallrosterdate should be changed in the table to indicate that this is a roster instead of tournaments
//TODO: Remove all warnings in tournamentview for a roster

//Student Reminders and Results
	if($studentID!=0)
	{
		//Show new tournaments signups with links to tournament pages, priority of events with links to events, previous tournament results.
		$output .= "<h2>Upcoming Tournaments</h2>";
		include("tournamentupcoming.php");
		$output .= $tournaments;
		$output .= "<h2>My Events</h2><h3> Fall Events: </h3>";
		$fallEventsQuery = "SELECT `event` FROM `teammateplace` INNER JOIN `student` on `teammateplace`.`studentID` = `student`.`studentID` INNER JOIN `tournamentevent` on `teammateplace`.`tournamenteventID` = `tournamentevent`.`tournamenteventID` inner join `event` on `tournamentevent`.`eventID` = `event`.`eventID` where `tournamentID` = 12 and `student`.`studentID` = $studentID";
		$result = $mysqlConn->query($fallEventsQuery) or error_log("\n<br />Warning: query failed:$fallEventsQuery. " . $mysqlConn->error. ". At file:". __FILE__ ." by " . $_SERVER['REMOTE_ADDR'] .".");
		$output .= "<ul>";
		while ($row = $result->fetch_assoc()):
			$output.="<li>".$row['event']."</li>";
		endwhile;
		$output .= "</ul><h3>Your Preferences</h3>";
		$priorityQuery = "SELECT `priority`, `event` FROM `eventchoice` INNER JOIN `eventyear` on `eventchoice`.`eventyearID` = `eventyear`.`eventyearID` inner join `event` on `eventyear`.`eventID` = `event`.`eventID` where `eventchoice`.`studentID` = $studentID and `year` = $currentYear";
		$result = $mysqlConn->query($priorityQuery) or error_log("\n<br />Warning: query failed:$priorityQuery. " . $mysqlConn->error. ". At file:". __FILE__ ." by " . $_SERVER['REMOTE_ADDR'] .".");
		$output.="<ol>";
		while ($row = $result->fetch_assoc()):
			$output.="<li>".$row['event']."</li>";
		endwhile;
		$output .= "</ol><h2>Previous Results</h2>";
		include("studentresults.php");
		$output .= $tournaments;
	}

	//Coach Reminders and Results
		$query = "SELECT * FROM `coach` WHERE `userID` = ".$_SESSION['userData']['id'];
		$result = $mysqlConn->query($query) or error_log("\n<br />Warning: query failed:$query. " . $mysqlConn->error. ". At file:". __FILE__ ." by " . $_SERVER['REMOTE_ADDR'] .".");
		if($result->num_rows){
			$row = $result->fetch_assoc();
			//TODO: Show new tournaments signups with link
			$output .= "<h2>Upcoming Tournaments</h2>";
			$output .= "<p>Add upcoming tournament information. Coming Soon..This website is a work in progress.  Currently, you can find all tournament information in the tournament tab above.</p>";
			$output .= "<h2>Recent Tournaments</h2>";
			$output .= "<p>Add recent tournament information</p>";
		}

  $output .= '<p>Logout from <a href="logout.php">Google</a></p>';
  $output .= '</div>';
}else{
  $output = '<h3 style="color:red">Some problem occurred, please try again.</h3>';
}
	echo $output;
?>
