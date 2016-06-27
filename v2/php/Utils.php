<?php
/**
 * Class that handle the util code
 * 
 * @package easygd
 * @author  Sheldon Led <sheldonled.ms@gmail.com>
 */
class Utils {

  private static $cfgfile;

  public static function setConfigs($json){
    self::$cfgfile = json_decode($json);
    return self::getConfigs();
  }
  public static function getConfigs(){
    if(    @self::$cfgfile->client_id == ""
        || @self::$cfgfile->client_secret == ""
        || @self::$cfgfile->folder_id == ""
      ) {
        return "Credentials information is invalid";
      } else {
        return self::$cfgfile;
      }
  }

  public static function getGoogleClient($token = true){
    $credentials = Utils::getConfigs();
    if(is_string($credentials))
      return $credentials;

    $client = new Google_Client();

    $client->setClientId($credentials->client_id);
    $client->setClientSecret($credentials->client_secret);
    $client->setRedirectUri("urn:ietf:wg:oauth:2.0:oob");
    $client->setScopes(array("https://www.googleapis.com/auth/drive"));

    if($token) {
      try {
        $client->setAccessType('offline');
        $client->setAccessToken(json_encode(self::$cfgfile->token));
      } catch(Exception $e) {
        return "Token error";
      }
    }
    return $client;
  }

  public static function setToken($authCode){
    $client = Utils::getGoogleClient(false);

    try
    {
      // Setting the auth
      $accessToken = $client->authenticate($authCode);
      $client->setAccessToken($accessToken);
      return $accessToken;
    }
    catch(Exception $e)
    {
      return "Error while creating the token file";
    }
  }
}
  