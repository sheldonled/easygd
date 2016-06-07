
	//The Getting Started's click function
	document.getElementById("gettingstarted").addEventListener("click", function(e){
		e.preventDefault();
		document.getElementById("tutorial").style.display = "block";
		this.style.display = "none";
	});
	views = document.getElementsByClassName("view");
	for(var i in views) {
		if(views[i].id == undefined || isNaN(i))
			continue;
		document.getElementById("sl"+views[i].id.replace("vw","")).addEventListener("click", function(e){
			e.preventDefault();
			showVw(this.id.replace("sl","vw"));
			if(["vwdelete","vwdownload","vwlist"].indexOf(this.id.replace("sl","vw")) >= 0) {
				document.getElementById(this.id.replace("sl","vw")).innerHTML = "Please Wait...";
				list(document.getElementById(this.id.replace("sl","vw")));
			}
		});

	}

	//The Gear's click function
	document.getElementById("goto-settings").addEventListener("click", function(e){
		e.preventDefault();
		xhr("get","config.json",null,function(result){
			result = JSON.parse(result);
			document.getElementById("email").value = result.email;
			document.getElementById("client_id").value = result.client_id;
			document.getElementById("client_secret").value = result.client_secret;
			document.getElementById("folder").value = result.folder;
		});
		document.getElementById("main").style.display = "none";
		document.getElementById("settings").style.display = "block";
	});
	//The Settings's cancel click function
	document.getElementById("cancel").addEventListener("click", function(e){
		e.preventDefault();
		document.getElementById("main").style.display = "block";
		document.getElementById("settings").style.display = "none";
	});
	//The Settings's Save function
	document.getElementById("save").addEventListener("click", function(e){
		e.preventDefault();
		form = document.getElementById("formsettings");
		xhr(form.method, form.action, new FormData(form), function(result){
			if(result == "ok") {
				msg("OK","Settings successfully saved.");
				document.getElementById("cancel").click();
			} else {
				msg("Error",result+". Want to try again?",
					function(){return true},
					function(){document.getElementById("cancel").click();}
					);
			}
		});
	});
	//The Upload's Send function
	document.getElementById("btnupload").addEventListener("click", function(e){
		e.preventDefault();
		form = document.getElementById("formupload");
		console.log(new FormData(form));
		xhr(form.method, form.action, new FormData(form), function(result){
			if(result == "ok") {
				msg("OK","File successfully uploaded to the folder.");
				document.getElementById("vwupload").style.display = "none";
			} else {
				msg("Error",result+". Want to try again?",
					function(){return true},
					function(){document.getElementById("vwupload").style.display = "none";}
					);
			}
		});
	});
	//The SetToken's Send function
	if(document.getElementById("btnsettoken")) {
		document.getElementById("btnsettoken").addEventListener("click", function(e){
			e.preventDefault();
			form = document.getElementById("formtoken");
			xhr(form.method, form.action, new FormData(form), function(result){
				if(result == "ok") {
					msg("OK","Token saved.");
				} else {
					msg("Error",result);
				}
			});
		});
	}
	function showVw(view) {
		document.getElementById("tutorial").style.display = "none";
		document.getElementById("vwupload").style.display = "none";
		document.getElementById("vwdownload").style.display = "none";
		document.getElementById("vwdelete").style.display = "none";
		document.getElementById("vwtoken").style.display = "none";
		document.getElementById("vwlist").style.display = "none";

		document.getElementById(view).style.display = "block";
	}
	/**
	 * This function manages the communication with the server.
	 * @param  string	method		The form method
	 * @param  string	action		The form action
	 * @param  FormData	formData	The form inside a FormData object
	 * @param  Function	cb			Does the something with the server result
	 * @return 			void
	 */
	function xhr(method, action, formData, cb){
			try
			{
				var XHR = new XMLHttpRequest();
	        	XHR.upload.onprogress = function(evt)
				{
					var progress = parseInt((evt.loaded / evt.total)*100);
					if(progress < 100)
						msg("Sending","Sending File, ("+progress+"%)...");
					else
						msg("Processing","Please wait...");
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
					    		msg("Message", this.responseText);
					    }
					    else
					    {
					    	// Error
					    	if(this.status == 404)
					    		msg("ERROR","Not Found.");
					    	else
					    		msg("ERROR","The Server doesn't respond.");
				    	}
					}
				};

			}
			catch(e)
			{
				msg("Error","Your browser doesn't support XMLHttpRequest. Try use this in an up to date browser (Like Firefox or Chrome)");
			}
	}
	/**
	 * This method shows a message to the user
	 * @param  string	msg			the message to be shown
	 * @param  Function	cb			The function that reacts to the OK button.
	 * @param  Function	cancelcb	If you want a confirm dialog, this function is called when 
	 *                            	the user presses the Cancel button.
	 * @return			void
	 */
	function msg(title,msg,cb,cancelcb) {
		var mask		= document.getElementById("mask"),
			message		= document.getElementById("message"),
			msgtitle	= document.getElementById("msgtitle"),
			msgcontent	= document.getElementById("msgcontent"),
			btnok		= document.getElementById("msgok"),
			btncancel	= document.getElementById("msgcancel"),
			close		= function() {
				msgtitle.textContent	= "";
				msgcontent.textContent	= "";
				btnok.style.display		= "none";
				btncancel.style.display	= "none";
				message.style.display	= "none";
				mask.style.display		= "none";
			};

		msgtitle.textContent = title;
		msgcontent.textContent = msg;
		message.style.display = "block";
		mask.style.display = "block";

		btnok.style.display = "block";
		btnok.addEventListener("click",function(){
			if(cb)
				cb();

			close();
		});

		if(cancelcb) {
			btncancel.style.display = "block";
			btncancel.addEventListener("click",function(){
				cancelcb();
				close();
			});
		}
	}

	function list(el) {
		xhr("get","index.php?p=list",null,function(result){
			try {
				el.innerHTML = ""
				files = JSON.parse(result);
				ul = document.createElement("ul");
				for(var i in files){
					li = document.createElement("li");
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
				if(el.id == "vwdelete") {
					el.innerHTML = "<p><strong>After click in the file link to delete, reload this page</strong></p>"+el.innerHTML;
				}
				if(files.length == 0)
					el.innerHTML = "<p><strong>The folder is Empty</strong></p>";
			} catch (e) {
				el.innerHTML = "<strong>"+result+"</strong>";
			}
		});
	}


	xhr("get","index.php?p=chosenfolder",null,function(result){
		if(result.toLocaleLowerCase().indexOf("error") >=0) {
			document.getElementById("chosenfolder").textContent = result;
		} else {
			document.getElementById("chosenfolder").textContent = "Folder Name: "+result;
		}
	});