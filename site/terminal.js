const canvas = document.querySelector("#glCanvas");
function setpixelated(context){
	context['imageSmoothingEnabled'] = false;       /* standard */
	context['mozImageSmoothingEnabled'] = false;    /* Firefox */
	context['oImageSmoothingEnabled'] = false;      /* Opera */
	context['webkitImageSmoothingEnabled'] = false; /* Safari */
	context['msImageSmoothingEnabled'] = false;     /* IE */
}

function setupCanvas(canvas) {
		 var dpr = window.devicePixelRatio || 2;
		 canvas.width = window.innerWidth/2 * dpr;
		 canvas.height = canvas.width*(3/4) * dpr;
		 var ctx = canvas.getContext('2d');
		 ctx.scale(dpr, dpr);
		 setpixelated(ctx);
		 return ctx;
}
var terminal = setupCanvas(canvas);

window.onresize = function(event) {
	terminal_resize();
};

var terminal_options = {
	n_lines: 20,
	n_columns: 50,
	font_family: 'serif',
	background: 'white',
	color: 'green'
}

var terminal_state = {
		width: 100,
		height: 100,
		font: '12px serif',
		font_size: 12,
		lines: [''],
		curr_line: 0
}

function terminal_clear(){
	terminal.fillStyle = terminal_options.background;
	terminal.fillRect(0, 0, terminal_state.width, terminal_state.height);
};

function terminal_resize(){
	terminal = setupCanvas(canvas)
	let width = canvas.width;
	let height = canvas.height;//Math.floor(width*(3/4)); // 4x3 aspect ratio
	terminal_state.width = width;
	terminal_state.height = height
	let font_size = Math.min(Math.floor(height/terminal_options.n_lines), Math.floor(width/terminal_options.n_columns));
	terminal_state.font = font_size+'px '+terminal_options.font_family;
	terminal_state.font_size = font_size;
	terminal_clear();
	terminal_update();
}

setInterval(terminal_update, 17);

function terminal_update(){
	//console.log(terminal_state.lines);
	let toprint = terminal_state.lines.slice(-1*(terminal_options.n_lines+1));
	for(let i = 0; i < toprint.length; i++){
			terminal.fillStyle = terminal_options.color;
			terminal.font = terminal_state.font;
			terminal.fillText(toprint[i], 0, (i+1)*terminal_state.font_size)
	}
}

function terminal_print(text){

	terminal.fillText(text, 50, 50);
}

function terminal_printchar(c){
	if(c == '\n'){
		terminal_state.lines.push('');
		terminal_state.curr_line = terminal_state.lines.length-1;
		console.log(terminal_state.curr_line);
	}else{
		terminal_state.lines[terminal_state.curr_line] += c;
	}
}

function terminal_print(string){
	for(var i = 0; i < string.length; i++){
		terminal_printchar(string[i]);
	}
	console.log(terminal_state.lines);
}

terminal_resize();
