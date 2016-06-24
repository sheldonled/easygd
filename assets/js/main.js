(function() {
  'use strict';
  //The Getting Started's click function
  var app = {
    version: document.getElementById("appversion").value,
    views : document.getElementsByClassName("view"),
    el : {
      gettingstarted : document.getElementById("gettingstarted"),
      gettoken : document.getElementById("gettoken"),
      tutorial: document.getElementById("tutorial"),
      gotoSettings : document.getElementById("goto-settings"),
      email : document.getElementById("email"),
      client_id : document.getElementById("client_id"),
      client_secret : document.getElementById("client_secret"),
      folder : document.getElementById("folder"),
      main : document.getElementById("main"),
      settings : document.getElementById("settings"),
      cancel : document.getElementById("cancel"),
      save : document.getElementById("save"),
      formsettings : document.getElementById("formsettings"),
      btnupload : document.getElementById("btnupload"),
      formupload : document.getElementById("formupload"),
      btnsettoken : document.getElementById("btnsettoken"),
      formtoken : document.getElementById("formtoken"),
      mask : document.getElementById("mask"),
      message : document.getElementById("message"),
      msgtitle : document.getElementById("msgtitle"),
      msgcontent : document.getElementById("msgcontent"),
      msgok : document.getElementById("msgok"),
      msgcancel : document.getElementById("msgcancel")
    },
    showVw: function(view) {
      for(var i in this.views)
        if(this.views[i].style)
          this.views[i].style.display = "none";

      document.getElementById(view).style.display = "block";

      if(view == "vwtoken"){
        easydgDB.listAll(function(error,obj){
          if(error){
            app.msg("ERROR", "indexedDB error: "+error);
            return
          }
          if(!obj) {
            app.msg("MESSAGE", "You have to set project credentials first");
          } else {
            app.el.gettoken.href = "https://accounts.google.com/o/oauth2/auth?response_type=code"
                                  +"&redirect_uri="+encodeURIComponent("urn:ietf:wg:oauth:2.0:oob")
                                  +"&client_id="+(obj.client_id)
                                  +"&scope="+encodeURIComponent("https://www.googleapis.com/auth/drive")
                                  +"&access_type=offline"
                                  +"&approval_prompt=auto"
                                  +"&user_id="+encodeURIComponent(obj.email);
            app.el.gettoken.target = "_blank";
            app.el.gettoken.textContent = "Get the Auth Code";
          }
        });
      }
    },
    /**
     * This function manages the communication with the server.
     * @param  string method    The form method
     * @param  string action    The form action
     * @param  FormData formData  The form inside a FormData object
     * @param  Function cb      Does the something with the server result
     * @return      void
     */
    xhr : function(method, action, formData, cb) {
      self = this;
      try {
        var XHR = new XMLHttpRequest();
        
        XHR.upload.onprogress = function(evt) {
          var progress = parseInt((evt.loaded / evt.total)*100);
          if(progress < 100)
            self.msg("Sending","Sending File, ("+progress+"%)...");
          else
            self.msg("Processing","Please wait...");
        };

        XHR.open (method, action, true);
        XHR.send(formData);

        XHR.onreadystatechange = function()
        {
          if (this.readyState === 4)
          {
              if (this.status >= 200 && this.status < 400)
              {
                // Success
                if(cb)
                  cb(this.responseText);
                else
                  self.msg("Message", this.responseText);
              }
              else
              {
                // Error
                if(this.status == 404)
                  self.msg("ERROR","Not Found.");
                else
                  self.msg("ERROR","The Server doesn't respond.");
              }
          }
        };
      } catch(e) {
        self.msg("Error","Your browser doesn't support XMLHttpRequest. Try use this in an up to date browser (Like Firefox or Chrome)");
      }
    },
    /**
     * This method shows a message to the user
     * @param  string msg     the message to be shown
     * @param  Function cb      The function that reacts to the OK button.
     * @param  Function cancelcb  If you want a confirm dialog, this function is called when 
     *                              the user presses the Cancel button.
     * @return      void
     */
    msg : function(title,msg,cb,cancelcb) {
        var self = this;
        close = function() {
          self.el.msgtitle.textContent  = "";
          self.el.msgcontent.textContent  = "";
          self.el.msgok.style.display   = "none";
          self.el.msgcancel.style.display = "none";
          self.el.message.style.display = "none";
          self.el.mask.style.display    = "none";
        };

      this.el.msgtitle.textContent = title;
      this.el.msgcontent.textContent = msg;
      this.el.message.style.display = "block";
      this.el.message.style.top = (document.body.scrollTop+100)+"px";
      this.el.mask.style.display = "block";
      this.el.mask.style.height = document.body.offsetHeight+"px";

      this.el.msgok.style.display = "block";
      this.el.msgok.addEventListener("click",function(){
        if(cb)
          cb();

        close();
      });

      if(cancelcb) {
        this.el.msgcancel.style.display = "block";
        this.el.msgcancel.addEventListener("click",function(){
          cancelcb();
          close();
        });
      }
    },
    upload : function(){},
    download : function(filename, fileid, filetype){
      switch(this.version) {
        case "v2-php":
        case "v3-php":
          url = "php/index.php?p=downloadfile&fileid="+encodeURIComponent(fileid)
                  +"&filetype="+encodeURIComponent(filetype)+"&filename="
                  +encodeURIComponent(filename);
          break;
        case "v3-js":
          url = "https://www.googleapis.com/drive/v3/files";
          break;
        default:
          this.msg("ERROR","App Version isn't setted");
          return;
          break;
      }
      window.open(url, "Download Easy GD");
    },
    list : function(el, cb){
      switch(this.version) {
        case "v2-php":
        case "v3-php":
          url = "php/index.php?p=list";
          break;
        case "v3-js":
          url = "https://www.googleapis.com/drive/v3/files";
          break;
        default:
          this.msg("ERROR","App Version isn't setted");
          break;
      }
      this.xhr("get",url,null,function(result){
        try {
          el.innerHTML = ""
          var files = JSON.parse(result),
              ul = document.createElement("ul");

          for(var i in files){
            var li = document.createElement("li"),
                a = document.createElement("a");
            li.textContent = files[i].name;
            li.classList = "clickable drivefile";
            li.id = files[i].id;
            li.name = files[i].type;
            ul.appendChild(li);
          }
          el.appendChild(ul);
          if(files.length == 0)
            el.innerHTML = "<p><strong>The folder is Empty</strong></p>";
          else
            if(cb)
              cb(el);

        } catch (e) {
          if(result.indexOf("File not found") >= 0){
            el.innerHTML = "Updating List...";
            window.setTimeout(function(){
              app.list(el, function(el){app.listevent(el);})
            }, 100);
          }
          el.innerHTML = "<strong>"+result+"</strong>";
        }
      });

    },
    listevent : function(el) {
      var fileslist = document.getElementsByClassName("drivefile");
      for(var i in fileslist){
        if(fileslist[i].className){
          switch(el.id) {
            case "vwdownload":
              fileslist[i].addEventListener("click", function(){
                app.download(this.textContent,this.id,this.name);
              });
              break;
            case "vwdelete":
              fileslist[i].addEventListener("click", function(){
                app.delete(this.textContent,this.id,this.name);
              });
              break;
            default:
              break;
          }
        }
      }
    },
    delete : function(filename, fileid, filetype){
      this.views.vwdelete.innerHTML = "Updating List...";
      switch(this.version) {
        case "v2-php":
        case "v3-php":
          url = "php/index.php?p=deletefile&fileid="+encodeURIComponent(fileid)
                  +"&filetype="+encodeURIComponent(filetype)+"&filename="
                  +encodeURIComponent(filename);
          break;
        case "v3-js":
          url = "https://www.googleapis.com/drive/v3/files";
          break;
        default:
          this.msg("ERROR","App Version isn't setted");
          return;
          break;
      }
      window.open(url, "Delete Easy GD");
      window.setTimeout(function(){
        app.list(app.views.vwdelete, app.listevent, app.views.vwdelete);
      }, 100);
    }
  };


/**
 * Handle IndeedDB database to save your information in your side of the app =)
 */
  var easydgDB = {
    dbname : "easydg",
    idb : (window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB),
    db : null,
    openDB : function(){
      var request = this.idb.open(this.dbname, 1);

      request.onerror = function(e) {
        // Error Alert
        app.msg("ERROR","Database error (indexedDB): " + e.target.errorCode);
      };
      request.onsuccess = function(e){
        easydgDB.db = e.target.result;
      };
      /**
       * Initial setup of the DB
       */
      request.onupgradeneeded = function(e){
        easydgDB.db = e.target.result;
        
        /**
         * Creating objectStore
         */
        var objectStore = easydgDB.db.createObjectStore(easydgDB.dbname, {
            keyPath: "id",
            autoIncrement: true
        });
        
        //Creating index
        objectStore.createIndex("email", "email", {
            unique:true
        });
      };
    },
    /**
     * List all objects and call the callback function to each object
     * PS: this was made thinking of array.push
     */
    listAll : function (cb) {
      var objectStore = easydgDB.db.transaction(easydgDB.dbname).objectStore(easydgDB.dbname);

      objectStore.openCursor().onsuccess = function(e) {
        var cursor = e.target.result;
        if(cursor) {
          if(cb)
            cb(null, cursor.value);

          cursor.continue();
        } else {
          return cb("DataBase is Empty, you have to set the credentials");
        }
      }
    },
    save : function (obj, cb) {
      var transaction = easydgDB.db.transaction([easydgDB.dbname], "readwrite");

      transaction.onerror = function(e) {
        app.msg("ERROR","Error message: "+e);
        if (cb)
          cb({error : e}, null);
      };
      var objectStore = transaction.objectStore(easydgDB.dbname);
      if (!obj.created) {
          obj.created = Date.now();
      }
      var request = objectStore.put(obj);
      request.onsuccess = function(e){
        if(cb){
          objectStore.get(request.result).onsuccess = function(e) {
            cb(null, e.target.result);
          };
        }
      };
    },
    del : function (id, cb) {
      var request = easydgDB.db.transaction([easydgDB.dbname], "readwrite").objectStore(easydgDB.dbname).delete(id);
      request.onsuccess = function (event) {
        if(cb)
          cb();
      };
    },
    dellAll : function() {
      easydgDB.listAll(function(error,obj){
        if(!error)
          easydgDB.del(obj.id);
      });
    }
  }; // easygdDB;
  easydgDB.openDB();
  window.setTimeout(easydgDB.dellAll,500);

  app.el.gettingstarted.addEventListener("click", function(e){
    e.preventDefault();
    app.el.tutorial.style.display = "block";
    this.style.display = "none";
  });
  for(var i in app.views) {
    if(app.views[i].id == undefined || isNaN(i))
      continue;
    document.getElementById("sl"+app.views[i].id.replace("vw","")).addEventListener("click", function(e){
      e.preventDefault();
      app.showVw(this.id.replace("sl","vw"));
      //Calling the list function
      if(["vwdelete","vwdownload","vwlist"].indexOf(this.id.replace("sl","vw")) >= 0) {
        document.getElementById(this.id.replace("sl","vw")).innerHTML = "Please Wait...";
        app.list(document.getElementById(this.id.replace("sl","vw")), function(el){app.listevent(el)});
      }
    });

  }

  //The Gear's click function
  app.el.gotoSettings.addEventListener("click", function(e){
    e.preventDefault();
    easydgDB.listAll(function(error,obj){
      if(error){
        app.Msg("ERROR", "indexedDB error: "+error);
        return
      }
      if(!obj.id) {
        app.el.email.value = "";
        app.el.client_id.value = "";
        app.el.client_secret.value = "";
        app.el.folder.value = "";
      } else {
        app.el.email.value = obj.email;
        app.el.client_id.value = obj.client_id;
        app.el.client_secret.value = obj.client_secret;
        app.el.folder.value = obj.folder_id;
      }
    });
    app.el.main.style.display = "none";
    app.el.settings.style.display = "block";
  });
  //The Settings's cancel click function
  app.el.cancel.addEventListener("click", function(e){
    e.preventDefault();
    app.el.main.style.display = "block";
    app.el.settings.style.display = "none";
  });
  //The Settings's Save function
  app.el.save.addEventListener("click", function(e){
    e.preventDefault();
    easydgDB.dellAll()
    easydgDB.save({
      email : app.el.email.value,
      client_id : app.el.client_id.value,
      client_secret : app.el.client_secret.value,
      folder_id : app.el.folder.value
    });
    app.msg("OK","Settings successfully saved.");
  });
  //The Upload's Send function
  app.el.btnupload.addEventListener("click", function(e){
    e.preventDefault();
      switch(app.version) {
        case "v2-php":
        case "v3-php":
          url = "php/index.php?p=upload";
          break;
        case "v3-js":
          url = "https://www.googleapis.com/drive/v3/files";
          break;
        default:
          app.msg("ERROR","App Version isn't setted");
          break;
      }
    app.xhr(app.el.formupload.method, url, new FormData(app.el.formupload), function(result){
      if(result == "ok") {
        app.msg("OK","File successfully uploaded to the folder.");
        for(var i in app.views)
          if(app.views[i].id)
            if(app.views[i].id == "vwupload")
              app.views[i].style.display = "none";
      } else {
        app.msg("Error",result+". Want to try again?",
          function(){return true},
          function(){
            for(var i in app.views)
              if(app.views[i].id == "vwupload")
                app.views[i].style.display = "none";
          }
        );
      }
    });
  });
  //The SetToken's Send function
  app.el.btnsettoken.addEventListener("click", function(e){
    e.preventDefault();

    app.xhr(app.el.formtoken.method, app.el.formtoken.action, new FormData(app.el.formtoken), function(result){
      if(result == "ok") {
        msg("OK","Token saved.");
      } else {
        msg("Error",result);
      }
    });
  });


  //Init
  var url = "";
  switch(app.version) {
    case "v2-php":
    case "v3-php":
      url = "php/index.php?p=chosenfolder";
      break;
    case "v3-js":
      url = "https://www.googleapis.com/drive/v3/files";
      break;
    default:
      this.msg("ERROR","App Version isn't setted");
      break;
  }
  app.xhr("get",url,null,function(result){
    if(result.toLocaleLowerCase().indexOf("error") >=0) {
      document.getElementById("chosenfolder").textContent = result;
    } else {
      document.getElementById("chosenfolder").textContent = "Folder Name: "+result;
    }
  });        
})();