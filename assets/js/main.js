(function() {
  'use strict';
  //The Getting Started's click function
  var app = {
    views : document.getElementsByClassName("view"),
    el : {
      gettingstarted : document.getElementById("gettingstarted"),
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
      this.el.mask.style.display = "block";

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
    list : function(el, cb) {
      this.xhr("get","index.php?p=list",null,function(result){
        try {
          el.innerHTML = ""
          var files = JSON.parse(result),
              ul = document.createElement("ul");

          for(var i in files){
            var li = document.createElement("li"),
                a = document.createElement("a");
            a.textContent = files[i].name;
            if(el.id != "vwlist") {
              a.href = "index.php?p="+el.id.replace("vw","")+"file&fileid="+encodeURIComponent(files[i].id)
                  +"&filetype="+encodeURIComponent(files[i].type)+"&filename="
                  +encodeURIComponent(files[i].name);
            }
            a.target = "_blank";
            li.appendChild(a);
            ul.appendChild(li);
          }
          el.appendChild(ul);
          if(files.length == 0)
            el.innerHTML = "<p><strong>The folder is Empty</strong></p>";

          if(cb)
            cb(el);

        } catch (e) {
          if(result.indexOf("File not found") >= 0){
            el.innerHTML = "Updating List...";
            window.setTimeout(function(){
              app.list(el, function(el){app.relist(el);})
            }, 100);
          }
          el.innerHTML = "<strong>"+result+"</strong>";
        }
      });
    },
    relist : function(el) {
      if(el.id != "vwdelete")
        return;
      for(var i in el.childNodes) {
        if(el.childNodes[i].nodeName == "UL") {
          for(var j in el.childNodes[i].childNodes) {
            if(el.childNodes[i].childNodes[j].nodeName == "LI") {
              el.childNodes[i].childNodes[j].addEventListener("click",function(){
                el.innerHTML = "Updating List...";
                window.setTimeout(function(){
                  app.list(el, function(el){app.relist(el);})
                }, 100);
              });
            }
          }
        }
      }
    }
  };

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
        app.list(document.getElementById(this.id.replace("sl","vw")), function(el){app.relist(el)});
      }
    });

  }

  //The Gear's click function
  app.el.gotoSettings.addEventListener("click", function(e){
    e.preventDefault();
    app.xhr("get","config.json",null,function(result){
      result = JSON.parse(result);
      app.el.email.value = result.email;
      app.el.client_id.value = result.client_id;
      app.el.client_secret.value = result.client_secret;
      app.el.folder.value = result.folder;
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
    app.xhr(app.el.formsettings.method, app.el.formsettings.action, new FormData(app.el.formsettings), function(result){
      if(result == "ok") {
        msg("OK","Settings successfully saved.");
        app.el.cancel.click();
      } else {
        msg("Error",result+". Want to try again?",
          function(){return true},
          function(){app.el.cancel.click();}
          );
      }
    });
  });
  //The Upload's Send function
  app.el.btnupload.addEventListener("click", function(e){
    e.preventDefault();
    app.xhr(app.el.formupload.method, app.el.formupload.action, new FormData(app.el.formupload), function(result){
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



  app.xhr("get","index.php?p=chosenfolder",null,function(result){
    if(result.toLocaleLowerCase().indexOf("error") >=0) {
      document.getElementById("chosenfolder").textContent = result;
    } else {
      document.getElementById("chosenfolder").textContent = "Folder Name: "+result;
    }
  });
})();