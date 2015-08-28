chrome.runtime.onInstalled.addListener(
	function() {
		// set default number of servers on install
		chrome.storage.local.set({"num_servers" : 10});
	}
);

//chrome.storage.local.get is asynchronous, so set (and check for updates from the options page) num_rows as early as possible ...
chrome.storage.local.get("num_servers", function(result) { num_rows = result.num_servers; });

//Load versions.json into versions variable
loadJSON(function(response) { versions = JSON.parse(response); });

chrome.webRequest.onResponseStarted.addListener(
	function(details) {
		chrome.storage.local.get("num_servers", function(result) { num_rows = result.num_servers; });
		var ip = details.ip;
		var full_url = details.url.split('/');
		var base_url = full_url[0] + '//' + full_url[2];
		
		for(var i = 0; i < details.responseHeaders.length; i++) {
			if (details.responseHeaders[i].name === 'Server') {
				var server = details.responseHeaders[i].value;
			}
            if (details.responseHeaders[i].name === 'X-Powered-By') {
				var powered_by = details.responseHeaders[i].value;
			}
			
			if (details.responseHeaders[i].name === 'X-Runtime') {
				var runtime = details.responseHeaders[i].value;
			}
			
			if (details.responseHeaders[i].name === 'X-Version') {
				var version = details.responseHeaders[i].value;
			}
			
			if (details.responseHeaders[i].name === 'X-AspNet-Version') {
				var aspnet_version = details.responseHeaders[i].value;
			}
		}
		
		if (server) { // to remove instances where the server is undefined
			for (var i = 0; i < versions.server.length; i++) {
				if (versions.server[i].type == server.split('/')[0]) {
					if (versionCompare(server.split('/')[1], versions.server[i].version) === -1) {
						chrome.browserAction.setBadgeBackgroundColor({color:"#EE9336"});
						chrome.browserAction.setBadgeText({text : "!"});
                        insert_row(ip,base_url,server);
						//chrome.runtime.sendMessage({msg_ip : ip , msg_url : base_url, msg_server : server});
						break; //exit loop if type matches, but version is vuln
						
					} else {
						//clear badge if web server in latest response is not vulnerable
						chrome.browserAction.setBadgeText({text : ""});
						//chrome.runtime.sendMessage({msg_ip : ip , msg_url: "N/A", msg_server : server});
						break; //exit loop if type matches, but version is ok
					}	
				} 
			}
			//Log every response...  covers servers not included in versions.json
			// GET DOUBLE LOG IF below matches ...
			console.log("IP: " + ip + " URL: " + details.url + " Server: " + server);
		}	
		
		if ((powered_by) || (runtime) || (version) || (aspnet_version)) {
            console.log("IP: " + ip + " URL: " + details.url + " Server: " + server + " Other: " + powered_by + "," + runtime + "," + version + "," + aspnet_version);
        }
},
	{urls: ["<all_urls>"]},["responseHeaders"]);
	
// From: https://gist.github.com/alexey-bass/1115557
function versionCompare(left, right) {
    if (typeof left + typeof right != 'stringstring')
        return false;
    
    var a = left.split('.')
    ,   b = right.split('.')
    ,   i = 0, len = Math.max(a.length, b.length);
        
    for (; i < len; i++) {
        if ((a[i] && !b[i] && parseInt(a[i]) > 0) || (parseInt(a[i]) > parseInt(b[i]))) {
            return 1;
        } else if ((b[i] && !a[i] && parseInt(b[i]) > 0) || (parseInt(a[i]) < parseInt(b[i]))) {
            return -1;
        }
    }
    
    return 0;
}


function loadJSON(callback) {
	var xmlhttp = new XMLHttpRequest();
	var versions_url = "versions.json";
	xmlhttp.open("GET",versions_url,false);
	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			callback(xmlhttp.responseText);
		}
	};
	xmlhttp.send(null);
}

function insert_row(ip,url,server) {
    //console.log("insert:" + "IP: " + ip + " URL: " + url + " Server: " + server);
    var table = document.getElementById("vuln_servers");
	var match = false;
	// check table for existing IP 
	for (var rowIndex = 1; rowIndex < table.rows.length; rowIndex++) {
		if (ip === table.rows.item(rowIndex).cells.item(0).innerHTML) {
			match = true;
			break;
		}
	}	
	//only add row if ip does not exist in the table
	if (!match) {
		if (table.rows.length < (num_rows + 1)) {
    		var row = table.insertRow(1);
			row.insertCell(0).innerHTML = ip;
			row.insertCell(1).innerHTML = url;
			row.insertCell(2).innerHTML = server;
		
		} else { 
			table.deleteRow(num_rows); //delete last row
			var row = table.insertRow(1);
			row.insertCell(0).innerHTML = ip;
			row.insertCell(1).innerHTML = url;
			row.insertCell(2).innerHTML = server;
		}
	}	
}

