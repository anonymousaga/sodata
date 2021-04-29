<?php
class User {

    function __construct($conn){
        if(!isset($this->db)){
            // Connect to the database
						$this->db = $conn;
            /*$conn = new mysqli($this->dbHost, $this->dbUsername, $this->dbPassword, $this->dbName);
            if($conn->connect_error){
                die("Failed to connect with MySQL: " . $conn->connect_error);
            }else{
                $this->db = $conn;
            }*/
        }
    }

    function checkUser($data = array()){
        if(!empty($data)){
            // Check whether the user already exists in the database
            $checkQuery = "SELECT * FROM `users` WHERE oauth_provider = '".$data['oauth_provider']."' AND oauth_uid = '".$data['oauth_uid']."'";
            $checkResult = $this->db->query($checkQuery);

            // Add modified time to the data array
            if(!array_key_exists('modified',$data)){
                $data['modified'] = date("Y-m-d H:i:s");
            }

            if($checkResult->num_rows > 0){
                // Prepare column and value format
                $colvalSet = '';
                $i = 0;
                foreach($data as $key=>$val){
                    $pre = ($i > 0)?', ':'';
                    $colvalSet .= $pre.$key."='".$this->db->real_escape_string($val)."'";
                    $i++;
                }
                $whereSql = " WHERE oauth_provider = '".$data['oauth_provider']."' AND oauth_uid = '".$data['oauth_uid']."'";

                // Update user data in the database
                $query = "UPDATE `users` SET ".$colvalSet.$whereSql;
                $update = $this->db->query($query);
            }else{
                // Add created time to the data array
                if(!array_key_exists('created',$data)){
                    $data['created'] = date("Y-m-d H:i:s");
                }

                // Prepare column and value format
                $columns = $values = '';
                $i = 0;
                foreach($data as $key=>$val){
                    $pre = ($i > 0)?', ':'';
                    $columns .= $pre.$key;
                    $values  .= $pre."'".$this->db->real_escape_string($val)."'";
                    $i++;
                }

                // Insert user data in the database
                $query = "INSERT INTO `users` (".$columns.") VALUES (".$values.")";
                $insert = $this->db->query($query);
								$userID = $this->db->insert_id;
								//If new user, check to see if the email of the user is already added.  If so, automatically give them access to their account.
								$query = "UPDATE `students` SET `userID` = $userID WHERE `email` LIKE '" . $data['email'] . "'";
								if ($this->db->query($query) === TRUE) {
										$queryPrivilege = "UPDATE `users` SET `privilege` = 1 WHERE `userID`=$userID";
										$this->db->query($queryPrivilege);
								} else {
									//if not a student email check coaches
									$query = "UPDATE `coaches` SET `userID` = $userID WHERE `email` LIKE '" . $data['email'] ."'";
									if ($this->db->query($query) === TRUE) {
										$queryPrivilege = "UPDATE `users` SET `privilege` = 1 WHERE `userID`=$userID";
										$this->db->query($queryPrivilege);
									} else {
										//If the email does not match or the email is not google, give the user a chance to provide token to link account.
										//TODO add a way for a user to do this.
									}
								}
							//If the email does not match or the email is not google, give the user a chance to provide token to link account.
						}

            // Get user data from the database
            $result = $this->db->query($checkQuery);
            $userData = $result->fetch_assoc();
        }

        // Return user data
        return !empty($userData)?$userData:false;
    }
}
