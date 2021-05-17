var binary_file;

const binaryRadios = document.querySelectorAll('input[name="binary"]');

binaryRadios.forEach(function(radio){
	radio.addEventListener('change', function(event) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					binary_file = xhr.response;
					spawn_worker();
				}
			}
		};
		xhr.open("GET", event.target.value);
		xhr.responseType = "arraybuffer";
		xhr.send();
	});
})

var worker;

function send_obj(obj){
	if(!worker)
		return
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