
var binary_file;

const fileSelector = document.getElementById('fileSelector')
fileSelector.addEventListener('change', (event) => {
	const file = event.target.files[0]
	const filereader = new FileReader()
	filereader.onloadend = function(evt) {
		if (evt.target.readyState === FileReader.DONE)
			binary_file = evt.target;
	}
	filereader.readAsBinaryString(file);
	run_binary();
}); 

function run_binary(){	
	if(!binary_file){
		console.log("No file loaded");
	}else{
		fetch('vm.wasm').then(response => response.arrayBuffer()).then(bytes =>{
			const memory = new WebAssembly.Memory({initial:1000});
			const importObject= {
					'env' : {
						'_getcharacter' : function() {},
						'_printstring' : handlePrintString,
						'_printchar' : function() {},
						'_read_image' : function() {
							return binary_file;
						},
						'__memory_base' : 0,
						'__table_base' : 0,
						'memory' : memory,
						'table': new WebAssembly.Table({initial: 2, element: 'anyfunc'})
					}
			};
			const module = new WebAssembly.Module(bytes);
			const instance = new WebAssembly.Instance(module, importObject);
			const arrayBuffer = memory.buffer;
			const buffer = new Uint8Array(arrayBuffer);
			instance.exports._main()
		
			function handlePrintString(ptr, len) {
				const view = new Uint8Array(memory.buffer, ptr, len);
				let string = '';
				for (let i = 0; i < len; i++) {
					string += String.fromCharCode(view[i]);
				}
				console.log(string);
			}
		});
	}

}

