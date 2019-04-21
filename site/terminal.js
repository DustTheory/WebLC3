var term = document.getElementById("terminal");
var termbuffer = "";
const clscr_str = "\e[1;1H\e[2J";
const clscr_len = 11;

var keydown;

function term_scroll_bottom(){
	term.scrollTop = term.scrollHeight;
}

function term_print_buffer(){
	term.innerHTML += termbuffer;
	termbuffer = "";
}

function term_print_string(str){
	term.innerHTML += str;
	var a = Math.max(term.innerHTML.indexOf("[2J[H[3J"),term.innerHTML.indexOf("1;1H[2J"));
	if(a != -1){
		term.innerHTML = term.innerHTML.substr(a+clscr_len);
	}
	term_scroll_bottom();
}

function term_print_line(line){
	term_print_string(line+'\n');
}

function buffer_add_str(str){
	termbuffer+=str;
}

function term_clear(){
	term.innerHTML = "";
}

term_clear();

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