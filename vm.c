#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <signal.h>
#include <unistd.h>
#include <fcntl.h>

#include <sys/time.h>
#include <sys/types.h>
#include <sys/termios.h>
#include <sys/mman.h>


// Allocate 65536 memory locations
uint16_t memory[UINT16_MAX];

// Muh registers
enum {
	R_R0 = 0, // 8 general purpose registers
	R_R1,
	R_R2,
	R_R3,
	R_R4,
	R_R5,
	R_R6,
	R_R7,
	R_PC,// Program counter
	R_COND, // Condition register
	R_COUNT // Not a register, just number of registers
};


// Muh operators
enum {
	OP_BR = 0, 	// Branch
	OP_ADD, 	// Add
	OP_LD, 		// Load
	OP_ST, 		// Store
	OP_JSR, 	// Jump register
	OP_AND, 	// Bitwise AND operator
	OP_LDR, 	// Load Register
	OP_STR, 	// Store register
	OP_RTI, 	// Unused
	OP_NOT, 	// Bitwise NOT operator
	OP_LDI, 	// Load indirect
	OP_STI, 	// Store indirect
	OP_JMP, 	// Jump
	OP_RES, 	// Reserved (unused)
	OP_LEA, 	// Load Effective Adress
	OP_TRAP 	// Execute trap
};

// Muh condition flags
enum {
	FL_POS = 1 << 0, // P
	FL_ZRO = 1 << 1, // Z
	FL_NEG = 1 << 2, // N
};

// Muh trap codes
enum
{
	TRAP_GETC = 0x20,  /* get character from keyboard */
	TRAP_OUT = 0x21,   /* output a character */
	TRAP_PUTS = 0x22,  /* output a word string */
	TRAP_IN = 0x23,    /* input a string */
	TRAP_PUTSP = 0x24, /* output a byte string */
	TRAP_HALT = 0x25   /* halt the program */
};

// Muh memory mapped registers
enum
{
    MR_KBSR = 0xFE00, /* keyboard status */
    MR_KBDR = 0xFE02  /* keyboard data */
};

// Registers are stored in an array
uint16_t reg[R_COUNT];

uint16_t check_key()
{
    fd_set readfds;
    FD_ZERO(&readfds);
    FD_SET(STDIN_FILENO, &readfds);

    struct timeval timeout;
    timeout.tv_sec = 0;
    timeout.tv_usec = 0;
    return select(1, &readfds, NULL, NULL, &timeout) != 0;
}

uint16_t mem_read(uint16_t address)
{
    if (address == MR_KBSR)
    {
        if (check_key())
        {
           memory[MR_KBSR] = (1 << 15);
            memory[MR_KBDR] = getchar();
        }
        else
        {
            memory[MR_KBSR] = 0;
        }
    }
    return memory[address];
}

void mem_write(uint16_t address, uint16_t val)
{
    memory[address] = val;
}

uint16_t sign_extend(uint16_t x, int bit_count){
	if(( x >> bit_count - 1) & 1) {
		x |= (0xFFFF << bit_count);
	}
	return x;
}

uint16_t update_flags(uint16_t r){

	// After addition there is a rule:
	// "The condition codes are set, based on whether the result is negative, zero, or positive"
	// That's what we do here

	if(reg[r] == 0)
		reg[R_COND] = FL_ZRO;
	else if(reg[r] >> 15) // A 1 in the leftmost bit indicates negative
		reg[R_COND] = FL_NEG;
	else
		reg[R_COND] = FL_POS;
}

uint16_t swap16(uint16_t x){
    return (x << 8) | (x >> 8);
}

void read_image_file(FILE* file){
    uint16_t origin;
    fread(&origin, sizeof(origin), 1, file);
    origin = swap16(origin);

    uint16_t max_read = UINT16_MAX - origin;
    uint16_t* p = memory+origin;
    size_t read = fread(p, sizeof(uint16_t), max_read, file);

    while(read-- > 0){
        *p = swap16(*p);
        ++p;
    }
}

int read_image(const char* image_path){
    FILE* file = fopen(image_path, "rb");
    if(!file)
        return 0;
    read_image_file(file);
    fclose(file);
    return 1;
}

struct termios original_tio;

void disable_input_buffering()
{
    tcgetattr(STDIN_FILENO, &original_tio);
    struct termios new_tio = original_tio;
    new_tio.c_lflag &= ~ICANON & ~ECHO;
    tcsetattr(STDIN_FILENO, TCSANOW, &new_tio);
}

void restore_input_buffering()
{
    tcsetattr(STDIN_FILENO, TCSANOW, &original_tio);
}

void handle_interrupt(int signal)
{
    restore_input_buffering();
    printf("\n");
    exit(-2);
}

	

int main(int argc, const char* argv[]){
	if (argc < 2)
	{
		/* show usage string */
		printf("lc3 [image-file1] ...\n");
		exit(2);
	}

	for (int j = 1; j < argc; ++j)
	{
		if (!read_image(argv[j]))
		{
			printf("failed to load image: %s\n", argv[j]);
			exit(1);
		}
	}
	
	signal(SIGINT, handle_interrupt);
	disable_input_buffering();
	
	// Set PC to starting position
	// 0x3000 is the default
	enum { PC_START = 0x3000 };
	reg[R_PC] = PC_START;

	char *instr_str[16];
	instr_str[0] = "BR";
	instr_str[1] = "ADD";
	instr_str[2] = "LD";
	instr_str[3] = "ST";
	instr_str[4] = "JSR";
	instr_str[5] = "AND";
	instr_str[6] = "LDR";
	instr_str[7] = "STR";
	instr_str[8] = "RTI";
	instr_str[9] = "NOT";
	instr_str[10] = "LDI";
	instr_str[11] = "STI";
	instr_str[12] = "JMP";
	instr_str[13] = "RES";
	instr_str[14] = "LEA";
	instr_str[15] = "TRAP";

	int debug_mode = 0;

	int running = 1;
	while(running){
		// Fetch instruction at R_PC
		uint16_t instr = mem_read(reg[R_PC]);
		// Increment R_PC
		reg[R_PC]++;
		// The operator is saved at the left 4 bits of the instruction
		uint16_t op = instr >> 12;
		if(debug_mode)
			printf("%s ", instr_str[op]);
		switch(op){
			case OP_ADD:
				{
                    /* destination register (DR) */
                    uint16_t r0 = (instr >> 9) & 0x7;
                    /* first operand (SR1) */
                    uint16_t r1 = (instr >> 6) & 0x7;
                    /* whether we are in immediate mode */
                    uint16_t imm_flag = (instr >> 5) & 0x1;
                
                    if (imm_flag)
                    {
                        uint16_t imm5 = sign_extend(instr & 0x1F, 5);
                        reg[r0] = reg[r1] + imm5;
                    }
                    else
                    {
                        uint16_t r2 = instr & 0x7;
                        reg[r0] = reg[r1] + reg[r2];
                    }
                
                    update_flags(r0);
				}
				break;
			case OP_AND:
				{
					// Most of this is coppied from the ADD instruction
					// Only difference is that the operator is & instead of +

					// DR - Destination register is in bits 9-11 inclusive
					// We bitshift 9 times and & with 0x7 (111 binary) to get 3 DR bits

					uint16_t r0 = (instr >> 9) & 0x7;

					// SR1 - First operand is in bits 6-8 inclusive. Same procedure above
					uint16_t r1 = (instr >> 6) & 0x7;

					// Immediate mode flag is bit 5
					uint16_t imm_flag = (instr >> 5) & 0x1;

					// Immediate mode means we'll not be reading a register for
					// addition but will instead use a 3+1 bit number from
					// the last 4 bits of the instruction

					if(imm_flag){
						// 0x1F is 11111 in binary. Gets imm5 unextended
						uint16_t imm5 =  sign_extend(instr & 0x1F, 5);
						reg[r0] = reg[r1] & imm5;
					}else{
						uint16_t r2 = instr & 0x7; // Last 3 bits of instruction
						reg[r0] = reg[r1] & reg[r2];
					}

					update_flags(r0);

				}
				break;
			case OP_NOT:
				{
					// NOT - Bit-Wise Complement
					// DR
					uint16_t r0 = (instr >> 9) & 0x7;
					// SR
					uint16_t r1 = (instr >> 6) & 0x7;
					reg[r0] = ~reg[r1];
					update_flags(r0);
				}
				break;
			case OP_BR:
				{
                    uint16_t pc_offset = sign_extend((instr) & 0x1ff, 9);
                    uint16_t cond_flag = (instr >> 9) & 0x7;
                    if (cond_flag & reg[R_COND])
                    {
                        reg[R_PC] += pc_offset;
                    }
				}
				break;
			case OP_JMP:
				{
					// JMP - Jump to location in register specified by bits 8-6
					uint16_t r1 = (instr >> 6) & 0x7;
					reg[R_PC] = reg[r1];
				}
				break;
			case OP_JSR:
				{
					// JSR - Jump SubRoutine
					// If bit 11 is set jump to adress at register specified in bits 6-8 inclusive - JSR
					// If not add PCoffset11 to PC - bits 0-10 inclusive - JSRR
					 reg[R_R7] = reg[R_PC];
					if((instr >> 11) & 1){
						reg[R_PC] += sign_extend(instr & 0x7ff, 11); 
					}
					else{
						reg[R_PC] = reg[((instr >> 6) & 0x7)];
					}
					break;
				}
				break;
			case OP_LD:
				{
					// LD
					uint16_t r1 = (instr >> 9) & 0x7;
					uint16_t pc_offset = sign_extend(instr & 0x1ff, 9);
					reg[r1] = mem_read(reg[R_PC] + pc_offset);
					update_flags(r1);
				}
				break;
			case OP_LDI:
				{
					// LDI - "Load indirect"
					// Loads a value from a memory address to a register
					// Instruction is compised of: 4 instr bits, 3 DR bits, and 9 PCoffset9 bits
					// PCoffset9 bits is a relative memory addres. Adding it to the incremented
					// PC counter gives us the address of the address of our value in memory
					// huh..

					uint16_t r0 = (instr >> 9) & 0x7;
					uint16_t pc_offset = sign_extend(instr & 0x1ff, 9);//0x1ff is 111111111 binary
					reg[r0] = mem_read(mem_read(reg[R_PC] + pc_offset));
					update_flags(r0);
				}
				break;
			case OP_LDR:
				{
					// DR
					uint16_t r0 = (instr >> 9) & 0x7;
					// BaseR
					uint16_t r1 = (instr >> 6) & 0x7;
					// offset6
					uint16_t offset = sign_extend(instr & 0x3f, 6);
					reg[r0] = mem_read(reg[r1] + offset);
					update_flags(r0);
				}
				break;
			case OP_LEA:
				{
					// LEA - Load Effective Address
					uint16_t r0 = (instr >> 9) & 0x7;
					uint16_t pc_offset = sign_extend(instr & 0x1ff, 9);
					reg[r0] = reg[R_PC] + pc_offset;
					update_flags(r0);
				}
				break;
			case OP_ST:
				{
					uint16_t r1 = (instr >> 9) & 0x7;
					uint16_t pc_offset = sign_extend(instr & 0x1ff, 9);
					mem_write(reg[R_PC] + pc_offset, reg[r1]);
				}
				break;
			case OP_STI:
				{
	    				uint16_t r0 = (instr >> 9) & 0x7;
    					uint16_t pc_offset = sign_extend(instr & 0x1ff, 9);
    					mem_write(mem_read(reg[R_PC] + pc_offset), reg[r0]);
				}    break;
			case OP_STR:
				{
					uint16_t r0 = (instr >> 9) & 0x7;
					uint16_t r1 = (instr >> 6) & 0x7;
					uint16_t offset = sign_extend(instr & 0x3F, 6);
					mem_write(reg[r1] + offset, reg[r0]);
				}
				break;
			case OP_TRAP:
				{
					switch (instr & 0xFF){
			    			case TRAP_GETC:
								reg[R_R0] = (uint16_t)getchar();
			        			break;
		        			case TRAP_OUT:
								putc((char)reg[R_R0], stdout);
								fflush(stdout);
							
	       						break;
    						case TRAP_PUTS:
								{
									uint16_t* c = memory + reg[R_R0];
									while(*c){
										putc((char)*c, stdout);
										++c;
									}
									fflush(stdout);
								}
        						break;
    						case TRAP_IN:
								printf("Enter a character: ");
								reg[R_R0] = (uint16_t)getchar();

								break;
					    	case TRAP_PUTSP:
							{
								uint16_t* c = memory + reg[R_R0];
								while(*c){
									char char1 = (*c) && 0xFF;
									putc(char1, stdout);
									char char2 = (*c) >> 8;
									if(char2)
										putc(char2, stdout);
									++c;
								}
								fflush(stdout);
							}
							break;
					    	case TRAP_HALT:
							{
								puts("HALT");
								fflush(stdout);
								running = 0;
							}
							break;
					}
				}
				break;
			case OP_RES:
			case OP_RTI:
			default:
				abort();
				break;
		}
	}
	restore_input_buffering();
	return 0;
}
