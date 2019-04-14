onmessage = function(e){
	let request = e.data.request;
	if(request == 'load_binary'){
		run_binary(e.data.binary);
	}
}

function getcharacter(){
	postMessage({
		request: 'get_character'
	});	
}

function printstring(s){
	postMessage({
		request: 'print_string',
		string: s
	});	
}

function printchar(c){
	postMessage({
		request: 'print_character',
		character: c
	});	
}

function terminate(reason){
	postMessage({
		request: 'terminate_me',
		reason: reason
	});	
}

function run_binary(binary_file){	
	if(!binary_file){
		terminate("No file loaded");
	}else{
		fetch('vm.wasm').then(response => response.arrayBuffer()).then(bytes =>{
			const memory = new WebAssembly.Memory({initial:1000});
			const arrayBuffer = memory.buffer;
			const importObject= {
					'env' : {
						'_getcharacter' : getcharacter,
						'_printstring' : handlePrintString,
						'_printchar' : printchar,
						'_get_image_size': function(){
							return binary_file.length;
						},
						'_read_image' : function(ptr, len) {
							let wasm_image = new Uint8Array(arrayBuffer, ptr, len);
							wasm_image.set(binary_file);
							return;
						},
						'__memory_base' : 0,	
						'memory' : memory,
						'table': new WebAssembly.Table({initial: 2, element: 'anyfunc'})
					}
			};
			const module = new WebAssembly.Module(bytes);
			const instance = new WebAssembly.Instance(module, importObject);
			const buffer = new Uint8Array(arrayBuffer);
			instance.exports._main()
		
			function handlePrintString(ptr, len, callback) {
				const view = new Uint8Array(memory.buffer, ptr, len);
				let string = '';
				for (let i = 0; i < len; i++) {
					string += String.fromCharCode(view[i]);
				}
				printstring(string);
			}
		});
	}

}

