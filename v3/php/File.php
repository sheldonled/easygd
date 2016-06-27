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

    try{
      return $service->files->get($fileID, ['alt' => 'media']);
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
          "name" => $file->getName(),
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

    //creating the fileMetadata object
    $fileMetadata = new Google_Service_Drive_DriveFile([
      'name' => $tmpfile["name"],
      'parents' => array($credentials->folder_id)
    ]);
    $fileMetadata->setDescription("Uploaded by Easy GD (v3)");
    $fileMetadata->setMimeType($tmpfile["type"]);

    try 
    {
      $fileData = file_get_contents($tmpfile["tmp_name"]);

      $createdFile = $service->files->create($fileMetadata, [
        'data' => $fileData,
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