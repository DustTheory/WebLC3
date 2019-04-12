#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <string>

int main(int argc, char *argv[]){
	if(argc < 2){
		printf("Please pass a file as an argument\n");
		return 0;
	}
	FILE *code = fopen(argv[1], "r");
	char ins[255];
	
	int line = 1;
	char op[4];
	uint16_t ins_m;

	
	while(fgets(ins, 255, (FILE*)code)){
		if(ins[0] == '.')
		       continue;
		try{
			sscanf(ins, "%s", op);
			if(strncmp(op, "ADD", 3) == 0){
				int r0, n1;
				char n2[4];
				
				sscanf(ins, (std::string(op) + " R%d R%d %s").c_str(), &r0, &n1, n2);
				if(n2[0] == '#'){
					int n = strtol(n2+1, NULL, 10);	
					ins_m = 0 | n | (1 << 5) | (n1 << 6) | (r0 << 9) | (1 << 12);	
				}else{
					int n;
					sscanf(n2, n2, "R%d", &n);
					ins_m = 0 | n | (n1 << 5) | (r0 << 9) | (1 << 12);
				}
				printf("%u\n", ins_m);
			}else if{}
			line++;
		}catch(int param){
			printf("ERROR ON LINE: %d:\n %s", line, ins);
		}	
	}
}
