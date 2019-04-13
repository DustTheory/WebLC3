extern uint16_t getcharacter();
extern void printchar();
extern void printstring(char *str, uint16_t len);
void _printstring(char * str){
	int len = 0;
	for(char *p = str; *p; p++){
		len++;
	}
	printstring(str, len);
}
extern void halt();



