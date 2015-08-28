function load_options() {
	chrome.storage.local.get("num_servers", function (result) {
		document.getElementById("num").value = result.num_servers;
		num_rows = result.num_servers;
	});
}


function save_options() {
	var new_val = parseInt(document.getElementById("num").value);

	if (new_val > 0) {
		// remove extra rows if the number is reduced
		if (new_val < num_rows) {
			var bg = chrome.extension.getBackgroundPage();
			var bg_table = bg.vuln_servers;
			var table_rows_length = bg_table.rows.length;
			var rowIndex = new_val + 1;
			while (rowIndex < table_rows_length) {
				bg_table.deleteRow(rowIndex);
				table_rows_length--;
			}
		}
		chrome.storage.local.set({"num_servers" : new_val});
		num_rows = new_val; //control for instances where the options page is not closed
	} else {
		alert("Value must be greater than 0!");
	}
}

document.addEventListener('DOMContentLoaded', load_options);
document.getElementById('btn_submit').addEventListener('click', save_options);


