var binary_file;

const fileSelector = document.getElementById('fileSelector')
fileSelector.addEventListener('change', (event) => {
	const file = event.target.files[0]
	const filereader = new FileReader()
	filereader.readAsArrayBuffer(file);
	filereader.onloadend = function(evt) {
		if (evt.target.readyState === FileReader.DONE){
			binary_file = new Uint8Array(evt.target.result);
			spawn_worker();
		}
	}	
}); 

var cnt = 0;

function spawn_worker(){
	let worker = new Worker('vm.js');
	worker.postMessage(binary_file.buffer, [binary_file.buffer]);
	worker.onmessage = function(event){
		cnt++;
		// if(cnt > 1000)
		// 	worker.terminate();
		var data = JSON.parse(ab2str(event.data));
		console.log(data);
		 if(data.request == "terminate_me"){
		 	worker.terminate();
		 	console.log("WORKER TERMINATED! Reason:");
		 	console.log(event.data.reason);
		 }else if(data.request == "print_string"){
			 term_print_string(data.string);
		 }else if(data.request == "print_character"){
		 	term_print_string(String.fromCharCode(data.character));
		}
	 }
}


function ab2str(buf) {
	return String.fromCharCode.apply(null, new Uint16Array(buf));
  }
  
  function str2ab(str) {
	var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
	var bufView = new Uint16Array(buf);
	for (var i=0, strLen=str.length; i<strLen; i++) {
	  bufView[i] = str.charCodeAt(i);
	}
	return buf;
  }
