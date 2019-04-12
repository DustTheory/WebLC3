
const importObject= {
	'env' : {
		'abort' : function() {},
		'_abort' : function() {},
		'_exit' : function() {},
		'_fclose' : function() {},
		'_fflush' : function() {},
		'_fopen' : function() {},
		'_fread' : function() {},
		'_getchar' : function() {},
		'_llvm_bswap_i16': function() {},
		'_printf' : function() {},
		'_putc' : function() {},
		'_putchar' : function() {},
		'_puts' : function () {},
		'__memory_base' : 0,
		'__table_base' : 0,
		'memory' : new WebAssembly.Memory({initial: 256}),
		'table': new WebAssembly.Table({initial: 2, element: 'anyfunc'})
	}
};

fetch('vm.wasm').then(response => 
	response.arrayBuffer()
).then(bytes => 
	WebAssembly.instantiate(bytes, importObject)
).then(result => 
	console.log(result.instance.exports._main())
);

