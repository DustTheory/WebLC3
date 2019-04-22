var binary_file;

const fileSelector = document.getElementById('fileSelector')
fileSelector.addEventListener('change', (event) => {
	const file = event.target.files[0]
	const filereader = new FileReader()
	filereader.readAsArrayBuffer(file);
	filereader.onloadend = function(evt) {
		if (evt.target.readyState === FileReader.DONE){
			binary_file = evt.target.result;
			spawn_worker();
		}
	}	
});

var worker;

function send_obj(obj){
	var ab = str2ab(JSON.stringify(obj));
	worker.postMessage(ab, [ab]);	
}	

function worker_send_keystroke(){
	send_obj({
		request: 'update_keydown',
		keydown: keydown
	});
}

function spawn_worker(){
	if(worker)
		worker.terminate();
	worker = new Worker('vm.js');
	worker.onmessage = function(event){
		var data = event.data;
		if(data.request == "terminate_me"){
			worker.terminate();
			console.log("WORKER TERMINATED! Reason:");
			console.log(event.data.reason);
		}else if(data.request == "update_terminal"){
			term_update(data.termbuffer);
		}
	}
	send_obj({
		request: 'binary_file',
		binary_file: ab2str(binary_file)
	});
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