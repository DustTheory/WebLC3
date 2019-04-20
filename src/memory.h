int16_t check_key()
{
   return 1;
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

void update_flags(uint16_t r){

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
