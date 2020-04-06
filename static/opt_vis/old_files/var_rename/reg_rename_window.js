var list_registers = [rax, rdx, rcx, rbx, rsi, rbp, rsp, rdi, eax, edx, ecx, ebx, esi, ebp, esp, edi,
r8, r9, r10, r11, r12, r13, r14, r15, 
xmmm0, xmmm1, xmmm2, xmmm3, xmmm4, xmmm5, xmmm6, xmmm7, xmmm8, xmmm9, xmmm10, xmmm11, xmmm12,
xmmm13, xmmm14, xmmm15];

// <p> rax: <input type="text" name="rax" value=""> </p>

d3.select("#reg_rename")
	.selectAll("p")
	.data(list_registers)
	.enter.append("p")
		.text(function(d){return d + ": ";})
		.append("input")
		.attr("name", function(d){
			return d;
		})
		.attr("type", "text");
