<?php
/**
 * Class that handle the directories
 * 
 * @package easygd
 * @author  Sheldon Led <sheldonled.ms@gmail.com>
 */
class Dir {
  public static function listFiles($folderId = false){
    $credentials = Utils::getConfigs();
    if(is_string($credentials))
      return $credentials;

    $client = Utils::getGoogleClient();

    if(is_string($client))
      return $client;

    $service = new Google_Service_Drive($client);

    if(!$folderId)
      $folderId = $credentials->folder_id;

    $pageToken  = NULL;
    $fileList   = [];
    $folderId   = (is_null($folderId) ? $service->about->get()->getRootFolderId() : $folderId);
    $i          = -1;
    do {
      try {
        $parameters = ["q" => "'".$folderId."' in parents"];
        if ($pageToken) {
        $parameters['pageToken'] = $pageToken;
        }

        $children = $service->files->listFiles($parameters);

        foreach ($children->getFiles() as $child)
          $fileList[++$i] = $child;
        
        $pageToken = $children->getNextPageToken();
      } catch (Exception $e) {
        return "An error occurred: " . $e->getMessage();
        $pageToken = NULL;
      }
    } while ($pageToken);
    return $fileList;
  }
}