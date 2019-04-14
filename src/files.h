/*void read_image_file(FILE* file){
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
*/
extern int get_image_size();

extern void read_image(uint8_t *ptr, int len);

void load_image_to_memory(uint8_t *image, int len){
	uint16_t origin;
	origin = ((uint16_t)image[0]) << 8 | (uint16_t)image[1];	
	uint16_t max_read = UINT16_MAX - origin;
	uint16_t *p = memory+origin;
	int i = 2;
	while(i < len){
		*p = ((uint16_t)image[i]) << 8 | (uint16_t)image[i+1];
		i+=2;
		++p;
	}
}

void load_image(){
	int len = get_image_size();
	uint8_t image[1000];
	read_image(image, len);
	load_image_to_memory(image, len);
	return;
}

