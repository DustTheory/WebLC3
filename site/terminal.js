var term = document.getElementById("terminal");
var termbuffer = "";

function term_scroll_bottom(){
	term.scrollTop = term.scrollHeight;
}

function term_print_buffer(){
	term.innerHTML += termbuffer;
	termbuffer = "";
}

function term_print_string(str){
	term.innerHTML += str;
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
