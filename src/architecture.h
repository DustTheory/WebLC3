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

