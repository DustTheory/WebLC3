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
	//var a = term.innerHTML.indexOf("[2J[H[3J");
	//if(a != -1){
	//	term.innerHTML = term.innerHTML.substr(a+clscr_len);
	//}
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
	keydown = event.keyCode;
	worker_send_keystroke();
});

document.addEventListener("keyup", event => {
	keydown = undefined;
});