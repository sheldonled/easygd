<?php
/**
 ****************************** HOW THIS FILE WORKS ******************************
 * First we have an autoload function, which loads the PHP files.
 * Then, we have a switch statement that do something depending on the message sent
 *    by the 'p' parameter. So the switch handles the options of the app.
 * The 'default' option of the switch is the home page of the webapp. This webapp
 *    is a SPA application, so the other options but 'default' just handles
 *    functionalities of the app, and has no VIEW, it only returns a message,
 *    and is used only for XHR requests.
 * Any sugestions? email me at sheldonled.ms@gmail.com =)
 */
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
$credentials = Utils::setConfigs(@$_POST["credentials"]);
if(is_string($credentials)){
  die($credentials);
}

switch (@$_GET["p"]) {
  case 'chosenfolder':
    $folder = File::getFileData($credentials->folder_id);
    if(!is_array($folder))
      echo "Error while getting folder name";
    else
      echo $folder["name"];
    break;//chosenfolder break
  case 'settoken':
    echo Utils::setToken($_POST["authcode"]);
    break;//settoken break
  case 'upload':
    echo File::upload($_FILES["fileupload"]);
    break;//upload break
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
      return "This is a Google File, Can not be downloaded.";
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
    break;//default break;
  }