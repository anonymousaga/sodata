$().ready(function() {
//wait for the page to load before the following is run
	checkPage();
	$(window).on('hashchange', function() {
				checkPage();
	});
	setTimeout(function() { loadpage("user") }, 3500000); //TODO: Update this as long as user is active
});
function checkPage(){
	var splitHash = location.hash.substr(1).split("-");
	if(splitHash[1])
	{
		//alert (splitHash[1]);
		//ignore hashes with dashes that are used for edit and other single pages
		//TODO: Maybe add special functions for some edit pages later.
		if(splitHash[0]=="tournament")
		{
				tournament(splitHash[2], splitHash[1]);
		}
	}
	else
	{
		$("section:not(#banner)").hide();
		if(splitHash[0])
		{
			loadpage(splitHash[0]);
			$("#mainHeader").html(splitHash[0]);
		}
		else
		{
			loadpage("user");
			$( "#main" ).show( "slow", function() {	});
		}
	}
}
function loadpage(myUrl)
{
	//$( "#main" ).hide( "fast", function() {	});
	if (myUrl)
	{
		var request = $.ajax({
		 url: myUrl +".php",
		 cache: false,
		 method: "POST",
		 dataType: "html"
		});
		request.done(function( html ) {
		 //$("label[for='" + field + "']").append(html);
		 $("#mainContainer").html(html);
		 switch (myUrl) {
               case 'students': prepareStudentsPage();
               break;

               case 'events': prepareEventsPage();
               break;
			   
			   case 'eventaddpop': prepareEventsAddPage();
               break;

               case 'tournaments': prepareTournamentsPage();
               break;

               default:
            }
		 $( "#main").show( "slow", function() {
			});
		});

		request.fail(function( jqXHR, textStatus ) {
		 $("#mainContainer").html("Error");
		});
	}
}

function getList(myPage, myData)
{
	//alert(JSON.stringify(myData) );
	//myData is a json object type
	var request = $.ajax({
	 url: myPage,
	 cache: false,
	 method: "POST",
	 data: myData,
	 dataType: "html"
	});
	request.done(function( html ) {
	 $("#list").html(html);
	 $('body,html').animate({scrollTop: $("#list").offset().top + "px"}, "slow");//move to search results
	});

	request.fail(function( jqXHR, textStatus ) {
	 $("#list").html("Search Error" + textStatus);
	});
}


function prepareStudentsPage()
{
	$("#addTo").hide();
	$("#searchDiv").hide();
	//Load Students
	getList("studentslist.php",{active: +$("#active").is(':checked')});
		// validate signup form on keyup and submit

	//if the active checkbox is changed, then the screen will repopulate with the entire science olympiad population.  It does not remember the last clicked search.
	$('#active').change(function() {
			getList("studentslist.php", {active: +$("#active").is(':checked')});
	});
	//when Find by Name is clicked, this initiates the search
	$("#findStudent").on( "submit", function( event ) {
		event.preventDefault();
		getList("studentslist.php", $( this ).serialize() );
	});
	//when Find by Event is clicked, this initiates the search
	$("#findByEvent").on( "submit", function( event ) {
		event.preventDefault();
		getList("studentslist.php", {eventsList: $("#eventsList").val(),active:1});
	});
	//when Find by Course is clicked, this initiates the search
	$("#findByCourse").on( "submit", function( event ) {
		event.preventDefault();
		getList("studentslist.php", {courseList: $("#courseList").val(),active:1});
	});
}

function studentRemove(myStudentID, studentName)
{
 if(confirm("Are you sure you want to delete the user named: " + studentName +"?  This removes all of their data and it is permanent!!!"))
 {
		var request = $.ajax({
		 url: "studentremove.php",
		 cache: false,
		 method: "POST",
		 data: {studentID:myStudentID},
		 dataType: "html"
		});
		request.done(function( html ) {
		 $(".modified").remove(); //remove any old modified notes
		 $("#student-" + myStudentID).before("<div class='modified' style='color:blue'>"+studentName+" removed permanently.</div>"); //add note to show modification
		 $("#student-" + myStudentID).remove(); //remove element
		});

		request.fail(function( jqXHR, textStatus ) {
			$(".modified").remove();
			$("#student-" + myStudentID).before("<div class='modified' style='color:red'>Removal Error:"+textStatus+"</div");
		});
	}
}

///////////////////
///Student Edit functions
//////////////////
function studentEdit(myStudentID)
{
	var request = $.ajax({
	 url: "studentedit.php",
	 cache: false,
	 method: "POST",
	 data: {studentID:myStudentID},
	 dataType: "html"
	});
	request.done(function( html ) {
	 //$("label[for='" + field + "']").append(html);
	 window.location.hash = '#student-edit-'+ myStudentID;
	 $("#mainContainer").html(html);
	 $("#eventAndPriority").hide();
	 $("#courseListDiv").hide();
	 $("#addTo").validate({
 		rules: {
 			first: "required",
 			last: "required",
			parent1First: "required",
			parent1Last: "required",
 			phone: 			{
 				phoneUS: true
 			},
			parent1Phone: 			{
				phoneUS: true
			},
 			yearGraduating: "required",
 			email: {
 				required: true,
 				email: true
 			},
			parent1Email: {
				required: true,
				email: true
			},
 		},
 		messages: {
 			first: "*Please enter the student\'s first name",
 			last: "*Please enter the student\'s last name",
 			yearGraduating: {
 				required: "*Enter the year the student is graduating",
 			},
 			email: {
 				required: "*Enter the student\'s email.",
 			},
 			phone: {
 				required: "*Enter the phone number in the correct format.",
 			},
 		},
 		submitHandler: function(form) {
 							form.submit();
 					}
 	});

	});

	request.fail(function( jqXHR, textStatus ) {
	 $("#mainContainer").html("Removal Error");
	});
}
function loadEventsList()
{
	//maybe load events asynchronous
}
function studentEventAddChoice(studentID)
{
	//adds the event choice selection
	$("#studentEventAdd").hide();
	$("#eventAndPriority").clone().appendTo("#studentEventAddDiv").show();
	$("#studentEventAddDiv").append("<a id='addThisEvent' href='javascript:studentEventAdd("+studentID+",this.id,this.value);'>Add</a>");
}
function studentEventRemove(myID)
{
	if(confirm("Are you sure you want to delete the event, called " + $("#eventchoice"+"-"+myID +" .event").text() +", from the user?"))
  {
		rowRemove(myID,"eventchoice");
	}
}
function studentEventAdd(student, field, value)
{
 // validate signup form on keyup and submit
 //alert("got"+$("#eventsList").val());
 var request = $.ajax({
	 url: "studenteventadd.php",
	 cache: false,
	 method: "POST",
	 data: { studentID: student, eventyearID : $("#eventsList").val(), priority : $("#priorityList").val() },
	 dataType: "text"
 });

 request.done(function( html ) {
	 //$("label[for='" + field + "']").append(html);
	 $(".modified").remove(); //removes any old update notices
	 var eventchoiceID = parseInt(html);
	 if (eventchoiceID>0)
	 {
		 //returns the current update
		 $("#events").append("<div id='eventchoice-" + eventchoiceID + "'><span class='event'>"+ $("#eventsList option:selected").text() + "-" + $("#priorityList option:selected").text() + "</span> <a href=\"javascript:studentEventRemove('" + eventchoiceID + "')\">Remove</a> <span class='modified' style='color:blue'>Event added.</span></div>");
	 }
	 else
	 {
		 $("#events").append("<span class='modified' style='color:red'>Error while attempting to add an event. Please, report details to site admin. "+html+"</span>");
	 }
 });

 request.fail(function( jqXHR, textStatus ) {
	 alert( "Request failed: " + textStatus );
 });
}
function studentCourseAddChoice(student, table)
{
	//adds the course list selection
 $("#courseListDiv").appendTo("#add"+table+"Div").show();
 $(".addCourseBtn").show();
 $("#add"+table).hide();
 $("#addThisCourse").remove();
 $("#add"+table+"Div").append("<a id='addThisCourse' href=\"javascript:studentCourseAdd('"+student+"','"+table+"')\">Add</a>");
}
function studentCourseRemove(myID,table)
{
	if(confirm("Are you sure you want to delete the course, called " + $("#"+table+"-"+myID +" .course").text() +", from the user?"))
  {
		rowRemove(myID,table);
	}
}

function studentCourseAdd(student, table)
{
 // validate signup form on keyup and submit
 var request = $.ajax({
	 url: "studentcourseadd.php",
	 cache: false,
	 method: "POST",
	 data: { studentID: student, tableName : table, courseID : $("#courseList").val() }, //TODO: must add priority
	 dataType: "text"
 });

 request.done(function( html ) {
	 $(".modified").remove(); //removes any old update notices
	 var myCourseID = parseInt(html);
	 if (myCourseID>0)
	 {
		 //returns the current update
		 $("#" + table).append("<div id='" + table + "-" + myCourseID + "'><span class='course'>"+ $("#courseList option:selected").text() + "</span> <a href=\"javascript:courseCompleted('" + myCourseID + "','" + $("#courseList option:selected").text() +"')\">Completed</a>  <a href=\"javascript:studentCourseRemove('" + myCourseID + "','"+table+"')\">Remove</a> <span class='modified' style='color:blue'>Course added.</span></div>");
	 }
	 else
	 {
		 $("#"+ table).append("<span class='modified' style='color:red'>Error while attempting to add a course. Please, report details to site admin.</span>");
	 }
 });

 request.fail(function( jqXHR, textStatus ) {
	 alert( "Request failed: " + textStatus );
 });
}


function courseCompleted(value, courseName)
{
	//todo
 // validate signup form on keyup and submit
 var request = $.ajax({
	 url: "studentcoursecompleted.php",
	 cache: false,
	 method: "POST",
	 data: { myID: value}, //TODO: must add priority
	 dataType: "text"
 });

 request.done(function( text ) {
	 $(".modified").remove(); //removes any old update notices
	 var myCourseID = parseInt(text);
	 if (myCourseID>0)
	 {
		 //returns the current update
		 var table = "coursecompleted";
		 var table2 = "courseenrolled";
		 $("#" + table).append("<div id='" + table + "-" + myCourseID + "'><span class='course'>"+ courseName + " </span><a href=\"javascript:studentCourseRemove('" + myCourseID + "','"+table+"')\">Remove</a> <span class='modified' style='color:blue'>Course added.</span></div>");
		 $("#"+table2+"-"+value).remove();
		 $("#"+table2).append("<span class='modified' style='color:blue'>Course removed.</span>");
	  }
	 else
	 {
		 var table = "courseenrolled";
		 $("#"+ table).append("<span class='modified' style='color:red'>Error while attempting to move a course. Please, report details to site admin.</span>");
	 }
 });

 request.fail(function( jqXHR, textStatus ) {
	 alert( "Request failed: " + textStatus );
 });
}

function fieldUpdate(myID,table,field,value)
{
 // validate signup form on keyup and submit
 var request = $.ajax({
	 url: "fieldupdate.php",
	 cache: false,
	 method: "POST",
	 data: { myid: myID, mytable:table, myfield : field, myvalue : value },
	 dataType: "text"
 });

 request.done(function( html ) {
	 //$("label[for='" + field + "']").append(html);
	 $(".modified").remove(); //removes any old update notices
	 $("#"+field).parent().append("<span class='modified' style='color:blue'>"+ html +"</span>"); //returns the current update
 });

 request.fail(function( jqXHR, textStatus ) {
	 alert( "Request failed: " + textStatus );
 });
}
function userPrivilege(myUser, field,value)
{
	//alert(JSON.stringify(myData) );
	//myData is a json object type

	var request = $.ajax({
	 url: "userprivilege.php",
	 cache: false,
	 method: "POST",
	 data: {userID: myUser, privilege: value},
	 dataType: "text"
	});
	request.done(function( html ) {
	 $(".modified").remove(); //removes any old update notices
	 $("#"+field).parent().append("<span class='modified' style='color:blue'>"+ html +"</span>"); //returns the current update
	});

	request.fail(function( jqXHR, textStatus ) {
	 alert( "Request failed: " + textStatus );
	});
}

///////////////////
///Student Edit functions
//////////////////
function coachEdit(myID)
{
	var request = $.ajax({
	 url: "coachedit.php",
	 cache: false,
	 method: "POST",
	 data: {coachID:myID},
	 dataType: "html"
	});
	request.done(function( html ) {
	 //$("label[for='" + field + "']").append(html);
	 window.location.hash = '#coach-edit-'+ myID;
	 $("#mainContainer").html(html);
	});

	request.fail(function( jqXHR, textStatus ) {
	 $("#mainContainer").html("Removal Error");
	});
}

///////////////////
///Event functions
//////////////////
function toggleSearch()
{
	$('#addTo').toggle();
}

function prepareEventsPage()
{
	$("#searchDiv").hide();

	getList("eventslist.php",{});
		// validate signup form on keyup and submit

	//when Find by Name is clicked, this initiates the search
	$("#findEvent").on( "submit", function( event ) {
		event.preventDefault();
		getList("eventslist.php", $( this ).serialize() );
	});
}

function prepareEventsEditPage(myEvent)
{
	$("#mainHeader").html("Edit an Event");
	 window.location.hash = '#event-edit-'+ myEvent;
	 var request = $.ajax({
	 	 url: "eventeditpop.php",
	 	 cache: false,
	 	 method: "POST",
	 	 data: {eventID:myEvent},
	 	 dataType: "html"
	 	});

	 	request.done(function( html ) {
	 		$("#mainContainer").html(html);
				prepareEventEditSubmit();
	 	});

	 request.fail(function( jqXHR, textStatus ) {
	  $("#mainContainer").html("Error loading events edit page.");
	 });
}

function prepareEventEditSubmit()
{
	// validate event form on keyup and submit
	$("#addTo").validate({
		rules: {
			eventName: "required",
			typeName: "required",
		},
		messages: {
			eventName: "*Please enter the name of the event.",
			typeName: "*Please enter the event type.",
		},
		submitHandler: function(form) {
			event.preventDefault();

			var request = $.ajax({
			 url: "eventedit.php",
			 cache: false,
			 method: "POST",
			 data: $("#addTo").serialize(),
			 dataType: "text"
			});

			request.done(function( html ) {
			 //$("label[for='" + field + "']").append(html);
				if(html=="1")
				{
					window.location.hash = '#events';
				}
				else
				{
					$("#addTo").append("<div class='modified' style='color:red'>"+html+"</div>");
				}
			});

		request.fail(function( jqXHR, textStatus ) {
		 $("#mainContainer").html("Removal Error");
		});
		}
	});
}
function prepareEventsYearPage(myYear)
{
	$("#mainHeader").html("Edit a Year's Events");

	 window.location.hash = '#eventyear-edit-'+ myYear;
	 var request = $.ajax({
	 	 url: "eventyearaddpop.php",
	 	 cache: false,
	 	 method: "POST",
	 	 data: {year:myYear},
	 	 dataType: "html"
	 	});

	 	request.done(function( html ) {
	 		$("#mainContainer").html(html);
			prepareEventsYearAdd();
	 	});

	 request.fail(function( jqXHR, textStatus ) {
	  $("#mainContainer").html("Error loading event's year page.");
	 });
}
function prepareEventsYearAdd()
{
	//change year to add to
	$("#year").change(function(){
			prepareEventsYearPage($( "#year" ).val());
	});
	$("#addLeader").hide();
	$("#eventID").hide();
	// validate event form on keyup and submit
	$("#addTo").validate({
		rules: {
			eventName: "required",
			typeName: "required",
		},
		messages: {
			eventName: "*Please enter the name of the event.",
			typeName: "*Please enter the event type.",
		},
		submitHandler: function(form) {
			event.preventDefault();
			//alert($("#addTo").serialize());
			var request = $.ajax({
			 url: "eventyearadd.php",
			 cache: false,
			 method: "POST",
			 data: $("#addTo").serialize(),
			 dataType: "html"
			});

			request.done(function( html ) {
			 //$("label[for='" + field + "']").append(html);
			 $(".modified").remove(); //removes any old update notices
				if(html>0)
				{
					//add event to list
					$("#eventsP").append("<div id='eventyear-" + html + "'>"+$("#eventsList option:selected" ).text()+" <a href='javascript:eventYearRemove(\""+html+"\")'>Remove</a></div>");
				}
				else
				{
					$("#eventsP").append("<div class='modified' style='color:red'>"+html+"</div>");
				}
			});

		request.fail(function( jqXHR, textStatus ) {
		 $("#mainContainer").html("Add event to year error");
		});
		}
	});
}

function eventYearLeader(myID)
{
	$("#mainHeader").html("Edit an Event's Leader");
  var eventName = $("#eventyear-"+myID + " .event").html();
	var eventLeaderName = $( "#eventyear-"+myID + " .eventleader" ).data( "id" );
	var year = $( "#year" ).val();
	 window.location.hash = '#eventyear-edit-leader-'+ myID;
			var request = $.ajax({
			 url: "eventyearleaderaddpop.php",
			 cache: false,
			 method: "POST",
			 data: {},
			 dataType: "html"
			});

			request.done(function( html ) {
			 //$("label[for='" + field + "']").append(html);
			 $(".modified").remove(); //removes any old update notices

				if(html)
				{
					$("#mainContainer").html(html);
					$("#eventID").html(myID).hide();
					$("#eventName").html(eventName);
					$("#year").html(year);
					$("#student").val(eventLeaderName);
					eventYearLeaderPrepare(myID);
				}
				else
				{
					$("#mainContainer").append("<div class='modified' style='color:red'>"+html+"</div>");
				}
			});

		request.fail(function( jqXHR, textStatus ) {
		 $("#mainContainer").html("Add leader to your eventyear error");
		});
}
function eventYearLeaderPrepare(myID)
{
	$("#addLeader").one( "submit", function( event ) {
		event.preventDefault();

			var request = $.ajax({
			 url: "eventyearleaderadd.php",
			 cache: false,
			 method: "POST",
			 data: {eventyearID: myID, studentID: $("#student").val()},
			 dataType: "html"
			});

			request.done(function( html ) {
			 //$("label[for='" + field + "']").append(html);
			 $(".modified").remove(); //removes any old update notices

				if(html>0)
				{
					prepareEventsYearPage($("#year").html());
					//add eventleader to list
					//$("#eventyear-"+ $("#eventID").html() + " .eventleader").html(" - " + $('#student option:selected').text());
					//store the student id
					//$( "#eventyear-"+ $("#eventID").html() + " .eventleader" ).data( "id", $("#student").val());
					//change link to Edit Leader
					//$("#leaderlink-"+$("#eventID").html()).html("Edit Leader");
				}
				else
				{
					$("#addLeader").append("<div class='modified' style='color:red'>"+html+"</div>");
				}
			});

			request.fail(function( jqXHR, textStatus ) {
		 		$("#addLeader").append("Add leader to your eventyear error");
			});
		});
}
function eventYearRemove(myID)
{
	if(confirm("Are you sure you want to delete the eventyear: " + $("#eventyear-"+myID+" .event").text() +"?  This removes the event permanently from this year!!!"))
  {
		rowRemove(myID,"eventyear");
	}
}

///////////////////
///Tournament functions
//////////////////

function prepareTournamentsPage()
{
		
		$("#searchDiv").hide();
		$("#addDiv").hide();
		//Load Students
		getList("tournamentslist.php",{});
			// validate signup form on keyup and submit

		//when Find by Name is clicked, this initiates the search
		$("#findTournament").on( "submit", function( event ) {
  		event.preventDefault();
  		getList("tournamentslist.php", $( this ).serialize() );
		});
			//Allow person to pick year
			for (i = new Date().getFullYear()+1; i > 1973; i--)
			{
			    $('#tournamentYear').append($('<option />').val(i).html(i));
			}
}

function toggleAdd()
{
	$('#addDiv').toggle();
}

function tournament(myID, type)
{
	var request = $.ajax({
	 url: "tournament"+type+".php",
	 cache: false,
	 method: "POST",
	 data: {myID: myID},
	 dataType: "html"
	});

	request.done(function( html ) {
	 //$("label[for='" + field + "']").append(html);
	 $(".modified").remove(); //removes any old update notices

		if(html)
		{
			//window.location.hash = '#tournament-view-'+ myID;
			$("#mainContainer").html(html);
			$.when( $("#tournamentTitle") ).done(function( x ) {
				//changes title after page loads
				$("#tournamentTitle").hide();
  			$("#mainHeader").html($("#tournamentTitle").html());
			});
			$.when( $(":submit") ).done(function( x ) {
				addToSubmit(myID);
			});
			//$("#mainHeader").html(myName);
		}
		else
		{
			$("#mainContainer").append("<div class='modified' style='color:red'>"+html+"</div>");
		}
	});

	request.fail(function( jqXHR, textStatus ) {
		$("#mainContainer").append("<div class='modified' style='color:red'>"+textStatus+"</div>");
	});
}

function tournamentEventsAddAll(myID, year)
{
	var request = $.ajax({
	 url: "tournamenteventsaddall.php",
	 cache: false,
	 method: "POST",
	 data: {tournamentID: myID, year: year},
	 dataType: "html"
	});

	request.done(function( html ) {
	 //$("label[for='" + field + "']").append(html);
	 $(".modified").remove(); //removes any old update notices

		if(html=="1")
		{
			window.location.hash = window.location.hash + "-updated";
		}
		else
		{
			$("#mainContainer").append("<div class='modified' style='color:red'>"+html+"</div>");
		}
	});

	request.fail(function( jqXHR, textStatus ) {
		$("#mainContainer").append("<div class='modified' style='color:red'>"+textStatus+"</div>");
	});
}


//TODO Work on this function to make it as resusable as possible
function addToSubmit(myID)
{
	$("#addTo").validate({
		submitHandler: function(form) {
			var formData = $("#addTo").serialize();
			formData+='&tournamentID='+myID;
			event.preventDefault();
			//alert($("#addTo").serialize());
			var request = $.ajax({
			 url: $("#addTo").attr('action'), //"tournamentteaminsert.php",
			 cache: false,
			 method: "POST",
			 data:  formData, //TODO:add for teamID for edited ones
			 dataType: "html"
			});

		request.done(function( html ) {
		 //$("label[for='" + field + "']").append(html);
		 $(".modified").remove(); //removes any old update notices
			if(html>0)
			{
				window.location.hash = '#tournament-view-'+myID;
			}
			else
			{
				$("#mainContainer").append("<div class='modified' style='color:red'>"+html+"</div>");
			}
		});

		request.fail(function( jqXHR, textStatus ) {
		 $("#mainContainer").html("Error.  Check file named " + $("#addTo").attr('action') + " exists.");
		});
		}
	});

	$('input').each(function() {
					$(this).rules('add', {
							required: true,
					});
			});

}

function tournamentTimeblockRemove(myID)
{
	if(confirm("Are you sure you want to delete the time block" + myID +"?  This removes the time block permanently!!!"))
  {
		rowRemove(myID,"timeblock");
	}
}
function rowRemove(myID,table)
{
 // validate signup form on keyup and submit
 var request = $.ajax({
	 url: "rowremove.php",
	 cache: false,
	 method: "POST",
	 data: { myid: myID, mytable:table},
	 dataType: "text"
 });

 request.done(function( html ) {
	 if(html==1) 	 {
		 $(".modified").remove(); //removes any old update notices
		 $("#" + table + "-" + myID).before("<div class='modified' style='color:blue'>"+$("#" + table + "-" + myID).text()+" removed permanently.</div>"); //add note to show modification
		 $("#" + table + "-" + myID).remove(); //remove element
	 }
	 else {
		 $(".modified").remove();
		 $("#" + table + "-" + myID).before("<div class='modified' style='color:red'>Removal Error:"+html+"</div");
	 }
 });

 request.fail(function( jqXHR, textStatus ) {
	 $(".modified").remove();
	 $("#" + table + "-" + myID).before("<div class='modified' style='color:red'>Removal Error:"+textStatus+"</div");
	 alert( "Request failed: " + textStatus );
 });
}
///////////////////
///Officer and Event Leader functions
//////////////////
function prepareOfficerAdd(myYear)
{
	 window.location.hash = '#officer-add';
	 	$("#mainHeader").html("Add An Officer");
		var request = $.ajax({
			url: "officeraddpop.php",
			cache: false,
			method: "POST",
			data: {year:myYear},
			dataType: "html"
		 });

		 request.done(function( html ) {
			 $("#mainContainer").html(html);
				 prepareOfficerAddSubmit();
		 });

		request.fail(function( jqXHR, textStatus ) {
		 $("#mainContainer").html("Error loading events edit page.");
		});
 }

 function prepareOfficerAddSubmit()
 {
	 // validate event form on keyup and submit
		$("#addTo").validate({
			rules: {
				position: "required",
			},
			messages: {
				eventName: "*Please enter the name of the leader's position.",
			},
			submitHandler: function(form) {
				event.preventDefault();
				//alert($("#addTo").serialize());
				var request = $.ajax({
				 url: "officeradd.php",
				 cache: false,
				 method: "POST",
				 data: $("#addTo").serialize(),
				 dataType: "text"
				});

				request.done(function( html ) {
				 //$("label[for='" + field + "']").append(html);
				 $(".modified").remove(); //removes any old update notices
					if(html>0)
					{
						//add event to list
						$("#addTo").append("<div class='modified' style='color:blue'>"+$("#student option:selected" ).text()+" added as "+ $("#position" ).val() +" for "+ $("#year option:selected" ).text()+"</div>");
					}
					else
					{
						$("#addTo").append("<div class='modified' style='color:red'>"+html+"</div>");
					}
				});

			request.fail(function( jqXHR, textStatus ) {
			 $("#mainContainer").html("Add event to year error");
			});
			}
		});
}
