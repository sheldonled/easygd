<?php
/**
 * Class that handle the directories
 * 
 * @package easygd
 * @author  Sheldon Led <sheldonled.ms@gmail.com>
 */
class Dir {
	public static function listFiles($folderId = false){
		$cfgfile = Utils::getConfigFile();
		if(is_string($cfgfile))
			return $cfgfile;

		$client = Utils::getGoogleClient();

		if(is_string($client))
			return $client;

		$service = new Google_Service_Drive($client);

		if(!$folderId)
			$folderId = $cfgfile["folder"];

		$pageToken	= NULL;
		$fileList	= array();
		$folderId	= (is_null($folderId) ? $service->about->get()->getRootFolderId() : $folderId);
		$i			= -1;
		do {
			try {
				$parameters = array();
				if ($pageToken) {
				$parameters['pageToken'] = $pageToken;
				}

				$children = $service->children->listChildren($folderId, $parameters);

				foreach ($children->getItems() as $child) {
					$fileId = $child->getId();
					$file = $service->files->get($fileId);
					$fileList[++$i] = File::getFileData($fileId);
				}
				$pageToken = $children->getNextPageToken();
			} catch (Exception $e) {
				return "An error occurred: " . $e->getMessage();
				$pageToken = NULL;
			}
		} while ($pageToken);
		return $fileList;
	}

	public static function haveFileName($folderId = false){
		$cfgfile = Utils::getConfigFile();
		if(is_string($cfgfile))
			return $cfgfile;

		$client = Utils::getGoogleClient();

		if(is_string($client))
			return $client;

		$service = new Google_Service_Drive($client);
		
	}

}