<?php
/**
 * Class that handle the util code
 * 
 * @package easygd
 * @author  Sheldon Led <sheldonled.ms@gmail.com>
 */
class Utils {

	public static function getConfigFile(){
		if(!is_file(dirname(__FILE__)."/config.json")) {
			return "The config.json file doesn't exist";
		} else {
			$config = json_decode(file_get_contents(dirname(__FILE__)."/config.json"), true);
			if(@$config["client_id"] == "" || @$config["client_secret"] == "" || @$config["folder"] == "") {
				return "The config.json file is misconfigured";
			}
			return $config;
		}
	}

	public static function getGoogleClient($token = true){
		$cfgfile = Utils::getConfigFile();
		if(is_string($cfgfile))
			return $cfgfile;

		$client = new Google_Client();

		$client->setClientId($cfgfile["client_id"]);
		$client->setClientSecret($cfgfile["client_secret"]);
		$client->setRedirectUri('urn:ietf:wg:oauth:2.0:oob');
		$client->setScopes(array('https:/'.'/www.googleapis.com/auth/drive'));

		if($token) {
			if(file_exists(__DIR__."/token")) {
				try {
					$client->setAccessType('offline');
					$client->setAccessToken(file_get_contents(__DIR__."/token"));
				} catch(Exception $e) {
					return "Token error";
				}
			}
			else
			{
				return "Token error";
			}
		}

		return $client;
	}

	public static function getTokenUrl(){
		$cfgfile = Utils::getConfigFile();
		if(is_string($cfgfile))
			return $cfgfile;
		if(@$cfgfile["email"] == "")
			return "Config.json file, missing email";

		$client = Utils::getGoogleClient(false);

		$client->setAccessType('offline');
  		
  		//Generating the auth url
  		$tmpUrl = parse_url($client->createAuthUrl());
		$query = explode('&', $tmpUrl['query']);
		//Adding user_id
		$query[] = 'user_id=' . urlencode($cfgfile["email"]);
		//The url;
		return $tmpUrl['scheme'].'://'.$tmpUrl['host'].
	  			$tmpUrl['path'].'?'.implode('&', $query);
	}

	public static function setToken($authCode){
		$client = Utils::getGoogleClient(false);

		if(!$token = fopen(dirname(__FILE__)."/token","r+")) {
			return "Error while creating the token file";
		}
		//Clearing the file
		ftruncate($token, 0);
		try
		{
			// Setting the auth
			$accessToken = $client->authenticate($authCode);
			$client->setAccessToken($accessToken);

			//Writing the new token
			if(fwrite($token, $accessToken)) {
				fclose($token);
				return "ok";
			}
		}
		catch(Exception $e)
		{
			return "Error while creating the token file";
		}
	}
}
	