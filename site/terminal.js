var term = document.getElementById("terminal");

var keydown;
var last_buffer = "";

function term_scroll_bottom(){
	term.scrollTop = term.scrollHeight;
}

function term_update(buffer){
	last_buffer = buffer;
}

setInterval(() => {
	term.innerHTML = last_buffer;
	term_scroll_bottom();
}, 50);

document.addEventListener("keydown", event => {
	if(event.shiftKey)
		keydown = event.keyCode;
	else if(event.keyCode >= 65 && event.keyCode <= 90)
		keydown = event.keyCode + 32;
	worker_send_keystroke();
});

document.addEventListener("keyup", event => {
	keydown = undefined;
	worker_send_keystroke();
});