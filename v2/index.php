<?php
	function autoload($className) {
	    //Manual entry
	    require_once("Dir.php");
	    require_once("File.php");
	    require_once("Utils.php");
		$classPath = explode('_', $className);
		for($i = 0; $i <= count($classPath); $i++) {
			if (@$classPath[0] != 'Google') {
				continue;
			}
			// Drop 'Google', and maximum class file path depth in this project is 3.
			$classPath = array_slice($classPath, 1, 2);

			$filePath = dirname(__FILE__) . '/Google-API/' . implode('/', $classPath) . '.php';
			if (file_exists($filePath)) {
				require_once($filePath);
			}
		}
	}
	spl_autoload_register('autoload');

	switch (@$_GET["p"]) {
		case 'settings':
			if(!$cfgfile = fopen("config.json","r+")) {
				echo "The config file doesn't exist";
				break;
			}
			//Clearing the file
			ftruncate($cfgfile, 0);

			//Writing the new settings
			if(fwrite($cfgfile, json_encode($_POST))) {
				echo "ok";
				fclose($cfgfile);
			}
			break;
		case 'chosenfolder':
			$cfgfile = Utils::getConfigFile();
			if(is_string($cfgfile)){
				echo $cfgfile;
				break;
			}
			$folder = File::getFileData($cfgfile["folder"]);
			if(!is_array($folder))
				echo "Error while getting folder name";
			else
				echo $folder["name"];
			break;//send break
		case 'settoken':
			echo Utils::setToken($_POST["authcode"]);
			break;//send break
		case 'upload':
			echo File::upload($_FILES["fileupload"]);
			break;//send break
		case 'list':
			$result = Dir::listFiles();
			if(is_string($result))
				echo $result;
			else
				echo json_encode($result);
			break;//list break
		case 'deletefile':
			$result = File::delete($_GET["fileid"]);
			if($result == "ok")
				echo "The file was successfully deleted from Google Drive";
			else
				echo $result;
			break;//deletefile break
		
		case 'downloadfile':
			if(strpos($_GET["filetype"],"google")) {
				die("This is a Google File, Can not be downloaded.");
			}
			$result = File::getFileContent($_GET["fileid"]);

			if(strlen($result) > 500){
				header('Content-Disposition: attachment; filename="'.$_GET["filename"].'"');
				header('Content-Type: '.$_GET["filetype"]);
				header("Content-Length: " . strlen($result));
				echo $result;
			} else {
				echo $result;
			}
			break;//downloadfile break
		default:
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Easy GD</title>
	<link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
	<!-- HTML for the message window -->
	<div id="mask"></div>
	<div id="message">
		<div id="msgtitle">Error:</div>
		<div id="msgcontent">The server is out.</div>
		<div id="btn">
			<button id="msgok" class="btnok">OK</button>
			<button id="msgcancel" class="btncancel">Cancel</button>
			<div class="clear"></div>
		</div>
	</div>

	<!-- HTML for the main view -->
	<div id="main" class="wrap">
		<a id="goto-settings"></a>
		<div class="clear"></div>
		<img src="../assets/img/easygd.png" alt="Easy GD" id="logo">
		<h1>Easy GD</h1>
		<p>Easy GD is a draft of a project that uses <a href="https://developers.google.com/drive/v3/web/quickstart/php" target="_blank">Drive Rest API</a> to manage files in your Google Drive Account.</p>
		<p><a href="" id="gettingstarted">Getting Started? Click here.</a></p>
		<div id="tutorial">
			<h3>Step 1 - Set project and Credentials:</h3>
			<ol>
				<li>
					Use <a href="https://console.developers.google.com/start/api?id=drive" target="_blank">Google Developers Console's wizard</a> to create or select a project in the Google Developers Console and automatically turn on the API. Click <strong>Continue</strong>, then <strong>Go to credentials</strong>.
				</li>
				<li>
					At the top of the page, select the <strong>OAuth consent screen</strong> tab. Select an <strong>Email address</strong>, enter a <strong>Product name</strong> if not already set, and click the <strong>Save</strong> button. 
				</li>
				<li>
					Select the <strong>Credentials</strong> tab, click the <strong>Add credentials</strong> button and select <strong>OAuth 2.0 client ID</strong> .
				</li>
				<li>
					Select the application type <strong>Other</strong>, enter the name you want (Like "Easy GD"), and click the <strong>Create</strong> button.
				</li>
				<li>
					Click in the Gear at the top of this page and fill the form with the info generated there (Client ID and Client Secret). Also, get the folder ID of the folder you want to work with, and the email of your Google Drive Account.
				</li>
				<li>In a Folder URL like: "https://drive.google.com/drive/u/0/folders/aaaaaaaaa", the Folder ID is "aaaaaaaaa"</li>
			</ol>
			<h3>Step 2 - Set the token:</h3>
			<ol>
				<li>
					The configuration file that you saved the settings above is the "config.json", the information in there is used for almost every code written here. But to ensure that you have the right to tamper with your files in your Google Drive account, we have to create a token file.
				</li>
				<li>
					To set the token, click in the link below. It will leads you to a Google page that will request you the authorization to see and manage your files in your Google Drive. It will allow this project to Upload, Delete and List all your files.
				</li>
				<li>
					<a href="" id="sltoken">Click here to set the token</a>
				</li>
			</ol>
		</div>

		<h2>Choose the action</h2>
		<ul id="actions">
			<li id="slupload">Upload</li>
			<li id="sldownload">Download</li>
			<li id="sllist">List</li>
			<li id="sldelete">Delete</li>
		</ul>
		<h4 id="chosenfolder"></h4>
		<div id="vwupload" class="view">
			<form method="post" action="index.php?p=upload" id="formupload" enctype="multipart/form-data">
				<p>
					<label for="fileupload">Choose File:</label>
					<input id="fileupload" name="fileupload" type="file">
				</p>
				</p>
					<input  id="btnupload"  class="btnok" name="send" type="button" value="Send">
					<div class="clear"></div>
				</p>
			</form>
		</div>
		<div id="vwdownload" class="view"></div>
		<div id="vwlist" class="view"></div>
		<div id="vwdelete" class="view"></div>
		<div id="vwtoken" class="view">
			<?php if(substr(Utils::getTokenUrl(),0,4) != "http"): ?>
				<p><?php echo Utils::getTokenUrl() ?></p>
			<?php else: ?>
			<a href="<?php echo Utils::getTokenUrl() ?>" target="_blank">Click here to Get Token</a>
			<form method="post" action="index.php?p=settoken" id="formtoken">
				<p>
					<label for="authcode">Auth code:</label>
					<input id="authcode" name="authcode" type="text">
				</p>
				</p>
					<input  id="btnsettoken"  class="btnok" name="send" type="button" value="Send">
					<div class="clear"></div>
				</p>
			</form>
			<?php endif; ?>
		</div>
	</div>

	<!-- HTML for the settings view -->
	<div id="settings" class="wrap">
		<h2>Settings</h2>
		<form method="post" action="index.php?p=settings" id="formsettings">
			<p>
				<label for="email">Email:</label>
				<input id="email" name="email" type="email">
			</p>
			<p>
				<label for="client_id">Client ID:</label>
				<input id="client_id" name="client_id" type="text">
			</p>
			<p>
				<label for="client_secret">Client Secret:</label>
				<input id="client_secret" name="client_secret" type="text">
			</p>
			<p>
				<label for="folder">Folder ID:</label>
				<input id="folder" name="folder" type="text">
			</p>
			</p>
				<input  id="save"  class="btnok" name="save" type="button" value="Save">
				<input  id="cancel" class="btncancel" name="cancel" type="button" value="Cancel">
				<div class="clear"></div>
			</p>
		</form>
	</div>
</body>
<script>
</script>
</html>
<?php
	break;//default break;
	}