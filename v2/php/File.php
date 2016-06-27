<?php
/**
 * Class that handle the directories
 * 
 * @package easygd
 * @author  Sheldon Led <sheldonled.ms@gmail.com>
 */
class File {
  public static function getFileContent($fileID){
    $client = Utils::getGoogleClient();

    if(is_string($client))
      return $client;
    $service = new Google_Service_Drive($client);

    try {
      $file = $service->files->get($fileID);
      $downloadUrl = $file->getDownloadUrl();
        $request = new Google_Http_Request($downloadUrl, 'GET', null, null);
        $httpRequest = $service->getClient()->getAuth()->authenticatedRequest($request);

        if ($httpRequest->getResponseHttpCode() == 200) {
        return $httpRequest->getResponseBody();
        } else {
          return $httpRequest->getResponseHttpCode();
        //return "An error occurred, please try again or reset the auth";
        }

      } catch(Exception $e) {
      return "An error occurred: " . $e->getMessage();
      }

  }

  public static function getFileData($fileId){

    $client = Utils::getGoogleClient();

    if(is_string($client))
      return $client;

    $service = new Google_Service_Drive($client);

    $file = $service->files->get($fileId);

    return  [
          "id" => $fileId,
          "name" => $file->getTitle(),
          "mimeType" => $file->getMimeType()
        ];

  }

  public static function delete($fileId){
    $client = Utils::getGoogleClient();

    if(is_string($client))
      return $client;

    $service = new Google_Service_Drive($client);

    try {
      $service->files->delete($fileId);
      return "ok";
    } catch (Exception $e) {
      return "An error occurred: " . $e->getMessage();
    }
  }

  public static function upload($tmpfile){
    $credentials = Utils::getConfigs();
    if(is_string($credentials))
      return $credentials;

    $client = Utils::getGoogleClient();

    if(is_string($client))
      return $client;

    $service = new Google_Service_Drive($client);

    //creating the file object
    $file = new Google_Service_Drive_DriveFile();
    $file->setTitle($tmpfile["name"]);
    $file->setDescription("Uploaded by Easy GD");
    $file->setMimeType($tmpfile["type"]);

    //Setting the folder as parent reference
    $parent = new Google_Service_Drive_ParentReference();
    $parent->setId($credentials->folder_id);
    $file->setParents(array($parent));

    try 
    {
      $data = file_get_contents($tmpfile["tmp_name"]);

      $createdFile = $service->files->insert($file, [
        'data' => $data,
        'mimeType' => $tmpfile["type"],
        'uploadType' => 'media'
      ]);

      //return $createdFile;
      return "ok";
    }
    catch (Exception $e)
    {
      print "An error ocurred: " . $e->getMessage();
    }
  }
}