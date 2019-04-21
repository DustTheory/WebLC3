extern int get_image_size();
extern void read_image(uint8_t *ptr, int len);

uint16_t load_image_to_memory(uint8_t *image, int len){
	uint16_t origin;
	origin = ((uint16_t)image[0]) << 8 | (uint16_t)image[1];	
	uint16_t max_read = UINT16_MAX - origin;
	uint16_t *p = memory+origin;
	int i = 2;
	
	while(i <= len && p != memory+origin+len){
		*p = ((uint16_t)image[i]) << 8 | (uint16_t)image[i+1];
		i+=2;
		++p;
	}
	return origin;
}

uint16_t load_image(){
	int len = get_image_size();
	read_image(&image[0], len);
	return load_image_to_memory(image, len);
}

