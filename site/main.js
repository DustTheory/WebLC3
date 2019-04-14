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

function spawn_worker(){
	let worker = new Worker('vm.js');
	console.log('Worker has been spawned');	
	worker.postMessage({
		request: 'load_binary',
		binary: binary_file
	});
	
	worker.onmessage = function(event){
		if(event.data.request == "terminate_me"){
			worker.terminate();
			console.log("WORKER TERMINATED! Reason:");
			console.log(event.data.reason);
		}else{
			console.log(event.data);
		}
	}
}


