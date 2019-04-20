extern int getcharacter();
extern void printchar();
extern void printstring(char *str, uint16_t len);
//extern void clear_term();

char *clsstr = "\e[1;1H\e[2J";
int clsstrlen = 10;

void swap(char *a, char *b){
	char tmp = *b;
	*b = *a;
	*a = tmp;
}

void _printint(int n){
	// Converts num to string instead of just printing a fucking
	// integer because I am a bad programmer
	// 
	// So. What are you gonna do about it? Huh?
	
	int len = 0;
	int n_cp = n;
	if(n_cp < 0)
			n_cp*=-1;
	while(n_cp > 0){
		n_cp/=10;
		len++;
	}
	char num[12];	
	int i = 0;
	if(n < 0){
		i = 1;
		num[0] = '-';
		n*=-1;
		len++;
	}
	for(; i < len; i++){
		num[i] = '0'+(n%10);
		n/=10;
	}
	for(int i = 0; i < len/2; i++){
		swap(num+i, num+(len-i-1));
	}
	if(len == 0){
		num[0] = '0';
		len = 1;
	}
	printstring(num, len);
}

void _printstring(char * str){
	//int len = 0;
	for(char *p = str; *p; p++){
		printchar(*p);
		//len++;
	}
	//printstring(str, len);
}
int waiting = 0;
int poll_interval = 100*1000; // miliseconds to microseconds
int curr_char = 257;

int _getcharacter(){
	int a = getcharacter();
	//_printstring("WAITING");
	//while(1){
	//	a = getcharacter();
	//	if(a != 257)
	//		return a;
	//	usleep(poll_interval);
	//}
	return a;
}

extern void halt();



