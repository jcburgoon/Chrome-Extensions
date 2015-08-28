// load table stored on background page when popup page is opened
document.addEventListener('DOMContentLoaded', function () {
	chrome.storage.local.get("num_servers", function (result) {
		document.getElementById("caption_num").innerHTML = result.num_servers;
	});
    var bg = chrome.extension.getBackgroundPage();
    var bg_table = bg.vuln_servers;
    var table = document.getElementById("vuln_servers_pop");

    // Load table stored in background page
    for (var rowIndex = 1; rowIndex < bg_table.rows.length; rowIndex++) {
        var row = table.insertRow(rowIndex);
		row.insertCell(0).innerHTML = bg_table.rows.item(rowIndex).cells.item(0).innerHTML;
		row.insertCell(1).innerHTML = bg_table.rows.item(rowIndex).cells.item(1).innerHTML;
		row.insertCell(2).innerHTML = bg_table.rows.item(rowIndex).cells.item(2).innerHTML;;
    }

});
