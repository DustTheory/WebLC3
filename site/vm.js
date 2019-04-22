var te = new TextEncoder("utf8");
var keydown;

var termbuffer = "";
var last_update = performance.now();

onmessage = function(event){
	var data = JSON.parse(ab2str(event.data));
	if(data.request == "binary_file")
		run_binary(new Uint8Array(str2ab(data.binary_file)));
	else if(data.request == "update_keydown"){
		update_keydown(data.keydown);
	}
}

function term_print_string(str){
	termbuffer += str;
	var a = Math.max(termbuffer.indexOf("[2J[H[3J"),termbuffer.indexOf("1;1H[2J"), termbuffer.indexOf("[1;1H[2J"));
	if(a != -1){
		termbuffer = termbuffer.substr(a+(termbuffer[a] == '1' ? 7 : 11));
	}
}

function update_terminal(){
	var curr_time = performance.now();
	if(curr_time-last_update >= 50){
		last_update = curr_time;
		send_obj({
			request: 'update_terminal',
			termbuffer: termbuffer
		});
	}
}

function printstring(s){
	term_print_string(s);
	update_terminal();
}

function printchar(c){
	term_print_string(String.fromCharCode(c));
	update_terminal();
}

function terminate(reason){
	send_obj({
		request: 'terminate_me',
		reason: te.encode(reason)
	});
}

function send_obj(obj){
	postMessage(obj);	
}

function update_keydown(key){
	if(key)
		keydown = key;
	else
		keydown = 257;
}

function get_keydown(){
	if(!keydown)
		keydown = 257;
	return keydown;
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
						'_printstring' : handlePrintString,
						'_printchar' : printchar,
						'_get_image_size': function(){
							return binary_file.length;
						},
						'_halt': ()=>terminate("Execution finished. Program halted."),
						'_read_image' : function(ptr, len) {
							let wasm_image = new Uint8Array(arrayBuffer, ptr, len);
							for (let i = 0; i <= len; i++) {
								wasm_image[i] = binary_file[i];
							}
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

			setInterval(update_terminal, 100); 

			instance.exports._main(); 

			loopdy_loop(instance);

			function handlePrintString(ptr, len, callback) {
				const view = new Uint8Array(arrayBuffer, ptr, len);
				let string = '';
				for (let i = 0; i < len; i++) 
					string += String.fromCharCode(view[i]);
				printstring(string);
			}
		});
	}

}

function loopdy_loop(instance){
	while(true){
		var msg = instance.exports._next_instruction(0, get_keydown());
		if(msg == 0){
			slowdy_loop(instance);
			break; // Slow down yo;
		}
	}
}

function slowdy_loop(instance){
	var id = setInterval(() => {
		var msg = instance.exports._next_instruction(0, get_keydown());
		keydown = undefined;
		if(msg == 1){
			clearInterval(id);
			loopdy_loop(instance);
		}
	}, 1);
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