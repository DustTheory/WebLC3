var te = new TextEncoder("utf8");

onmessage = function(event){
	console.log("you've got mail");
	var data = JSON.parse(ab2str(event.data));
	if(data.request == "binary_file")
		run_binary(new Uint8Array(str2ab(data.binary_file)));
	else if(data.request == "update_keydown"){
		console.log("YEE");
		update_keydown(data.keydown);
	}
}

var keydown;

function printstring(s){
	send_obj({
		request:'print_string',
		string: s+'\n'
	});
}

function printchar(c){
	send_obj({
		request:'print_character',
		character: c
	});
}

function terminate(reason){
	send_obj({
		request: 'terminate_me',
		reason: te.encode(reason)
	});
}

function send_obj(obj){
	var ab = str2ab(JSON.stringify(obj));
	postMessage(ab, [ab]);	
}

function clearterm(){
	send_obj({
		request: 'clear_term'
	});
}

function update_keydown(key){
	keydown = key;
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
						'_getcharacter' : function(){
							console.log("WUT?");
							if(!keydown)
								return 257;
							return keydown;
						},
						'_printstring' : handlePrintString,
						'_printchar' : printchar,
						'_clear_term': clearterm,
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
}				printstring(string);
			}
		});
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