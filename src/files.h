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

extern char* read_image();
