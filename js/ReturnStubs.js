var STUB0 = {};

//  This is from my ~/a.out executable
STUB0.dot = `digraph g {
B0 [shape=box, style=solid, label="_init\n0x400418: sub $0x8,%rsp\n0x40041c: mov 0x200bd5(%rip),%rax\n0x400423: test %rax,%rax\n0x400426: jz 0x7(%rip) 1, 0"];
B1 [shape=box, style=solid, label="_init\n0x400428: call 0x48(%rip) 1, 0"];
B2 [shape=box, style=solid, label="_init\n0x40042d: add $0x8,%rsp\n0x400431: ret near (%rsp) 1, 0"];
B3 [shape=box, style=solid, label="printf\n0x400450: jmp 0x200bc2(%rip) 1, 0"];
B4 [shape=box, style=solid, label="__libc_start_main\n0x400460: jmp 0x200bba(%rip) 1, 0"];
B5 [shape=box, style=solid, label="__gmon_start__\n0x400470: jmp 0x200bb2(%rip) 1, 0"];
B6 [shape=box, style=solid, label="_start\n0x400480: xor %ebp,%ebp\n0x400482: mov %rdx,%r9\n0x400485: pop %rsi\n0x400486: mov %rsp,%rdx\n0x400489: and $0xfffffff0,%rsp\n0x40048d: push %rax\n0x40048e: push %rsp\n0x40048f: mov $0x400600,%r8\n0x400496: mov $0x400590,%rcx\n0x40049d: mov $0x400576,%rdi\n0x4004a4: call 0xffffffbc(%rip) 1, 0"];
B7 [shape=box, style=solid, label="_start\n0x4004a9: hlt  1, 0"];
B8 [shape=box, style=solid, label="deregister_tm_clones\n0x4004b0: mov $0x601047,%eax\n0x4004b5: push %rbp\n0x4004b6: sub $0x601040,%rax\n0x4004bc: cmp $0xe,%rax\n0x4004c0: mov %rsp,%rbp\n0x4004c3: jbe 0x1d(%rip) 1, 0"];
B9 [shape=box, style=solid, label="deregister_tm_clones\n0x4004c5: mov $0x0,%eax\n0x4004ca: test %rax,%rax\n0x4004cd: jz 0x13(%rip) 1, 0"];
B10 [shape=box, style=solid, label="deregister_tm_clones\n0x4004cf: pop %rbp\n0x4004d0: mov $0x601040,%edi\n0x4004d5: jmp %rax 1, 0"];
B11 [shape=box, style=solid, label="deregister_tm_clones\n0x4004e0: pop %rbp\n0x4004e1: ret near (%rsp) 1, 0"];
B12 [shape=box, style=solid, label="register_tm_clones\n0x4004f0: mov $0x601040,%esi\n0x4004f5: push %rbp\n0x4004f6: sub $0x601040,%rsi\n0x4004fd: sar $0x3,%rsi\n0x400501: mov %rsp,%rbp\n0x400504: mov %rsi,%rax\n0x400507: shr $0x3f,%rax\n0x40050b: add %rax,%rsi\n0x40050e: sar $0x1,%rsi\n0x400511: jz 0x17(%rip) 1, 0"];
B13 [shape=box, style=solid, label="register_tm_clones\n0x400513: mov $0x0,%eax\n0x400518: test %rax,%rax\n0x40051b: jz 0xd(%rip) 1, 0"];
B14 [shape=box, style=solid, label="register_tm_clones\n0x40051d: pop %rbp\n0x40051e: mov $0x601040,%edi\n0x400523: jmp %rax 1, 0"];
B15 [shape=box, style=solid, label="register_tm_clones\n0x400528: pop %rbp\n0x400529: ret near (%rsp) 1, 0"];
B16 [shape=box, style=solid, label="__do_global_dtors_aux\n0x400530: cmp $0x0,0x200b09(%rip)\n0x400537: jnz 0x13(%rip) 1, 0"];
B17 [shape=box, style=solid, label="__do_global_dtors_aux\n0x400539: push %rbp\n0x40053a: mov %rsp,%rbp\n0x40053d: call 0xffffff73(%rip) 1, 0"];
B18 [shape=box, style=solid, label="__do_global_dtors_aux\n0x400542: pop %rbp\n0x400543: mov $0x1,0x200af6(%rip) 1, 0"];
B19 [shape=box, style=solid, label="__do_global_dtors_aux\n0x40054a: REP ret near (%rsp) 1, 0"];
B20 [shape=box, style=solid, label="frame_dummy\n0x400550: mov $0x600e10,%edi\n0x400555: cmp $0x0,(%rdi)\n0x400559: jnz 0x7(%rip) 1, 0"];
B21 [shape=box, style=solid, label="frame_dummy\n0x40055b: jmp 0xffffff95(%rip) 1, 0"];
B22 [shape=box, style=solid, label="frame_dummy\n0x400560: mov $0x0,%eax\n0x400565: test %rax,%rax\n0x400568: jz 0xfffffff3(%rip) 1, 0"];
B23 [shape=box, style=solid, label="frame_dummy\n0x40056a: push %rbp\n0x40056b: mov %rsp,%rbp\n0x40056e: call %rax 1, 0"];
B24 [shape=box, style=solid, label="frame_dummy\n0x400570: pop %rbp\n0x400571: jmp 0xffffff7f(%rip) 1, 0"];
B25 [shape=box, style=solid, label="main\n0x400576: push %rbp\n0x400577: mov %rsp,%rbp\n0x40057a: mov $0x400614,%edi\n0x40057f: mov $0x0,%eax\n0x400584: call 0xfffffecc(%rip) 1, 0"];
B26 [shape=box, style=solid, label="main\n0x400589: mov $0x0,%eax\n0x40058e: pop %rbp\n0x40058f: ret near (%rsp) 1, 0"];
B27 [shape=box, style=solid, label="__libc_csu_init\n0x400590: push %r15\n0x400592: mov %edi,%r15d\n0x400595: push %r14\n0x400597: mov %rsi,%r14\n0x40059a: push %r13\n0x40059c: mov %rdx,%r13\n0x40059f: push %r12\n0x4005a1: lea 0x200858(%rip),%r12\n0x4005a8: push %rbp\n0x4005a9: lea 0x200858(%rip),%rbp\n0x4005b0: push %rbx\n0x4005b1: sub %r12,%rbp\n0x4005b4: xor %ebx,%ebx\n0x4005b6: sar $0x3,%rbp\n0x4005ba: sub $0x8,%rsp\n0x4005be: call 0xfffffe5a(%rip) 1, 0"];
B28 [shape=box, style=solid, label="__libc_csu_init\n0x4005c3: test %rbp,%rbp\n0x4005c6: jz 0x20(%rip) 1, 0"];
B29 [shape=box, style=solid, label="__libc_csu_init\n0x4005c8: nop 0x0(%rax,%rax,1) 1, 0"];
B30 [shape=box, style=solid, label="__libc_csu_init\n0x4005d0: mov %r13,%rdx\n0x4005d3: mov %r14,%rsi\n0x4005d6: mov %r15d,%edi\n0x4005d9: call 0x0(%r12,%rbx,8) 1, 0"];
B31 [shape=box, style=solid, label="__libc_csu_init\n0x4005dd: add $0x1,%rbx\n0x4005e1: cmp %rbp,%rbx\n0x4005e4: jnz 0xffffffec(%rip) 1, 0"];
B32 [shape=box, style=solid, label="__libc_csu_init\n0x4005e6: add $0x8,%rsp\n0x4005ea: pop %rbx\n0x4005eb: pop %rbp\n0x4005ec: pop %r12\n0x4005ee: pop %r13\n0x4005f0: pop %r14\n0x4005f2: pop %r15\n0x4005f4: ret near (%rsp) 1, 0"];
B33 [shape=box, style=solid, label="__libc_csu_fini\n0x400600: REP ret near (%rsp) 1, 0"];
B34 [shape=box, style=solid, label="_fini\n0x400604: sub $0x8,%rsp\n0x400608: add $0x8,%rsp\n0x40060c: ret near (%rsp) 1, 0"];
B27 -> B0 [style=solid, color="black"];
B0 -> B1 [style=solid, color="black"];
B1 -> B2 [style=solid, color="black"];
B0 -> B2 [style=solid, color="black"];
B25 -> B3 [style=solid, color="black"];
B6 -> B4 [style=solid, color="black"];
B1 -> B5 [style=solid, color="black"];
B6 -> B7 [style=solid, color="black"];
B17 -> B8 [style=solid, color="black"];
B8 -> B9 [style=solid, color="black"];
B9 -> B10 [style=solid, color="black"];
B9 -> B11 [style=solid, color="black"];
B8 -> B11 [style=solid, color="black"];
B21 -> B12 [style=solid, color="black"];
B24 -> B12 [style=solid, color="black"];
B12 -> B13 [style=solid, color="black"];
B13 -> B14 [style=solid, color="black"];
B13 -> B15 [style=solid, color="black"];
B12 -> B15 [style=solid, color="black"];
B16 -> B17 [style=solid, color="black"];
B17 -> B18 [style=solid, color="black"];
B11 -> B18 [style=solid, color="black"];
B16 -> B19 [style=solid, color="black"];
B18 -> B19 [style=solid, color="black"];
B20 -> B21 [style=solid, color="black"];
B22 -> B21 [style=solid, color="black"];
B20 -> B22 [style=solid, color="black"];
B22 -> B23 [style=solid, color="black"];
B23 -> B24 [style=solid, color="black"];
B25 -> B26 [style=solid, color="black"];
B27 -> B28 [style=solid, color="black"];
B2 -> B28 [style=solid, color="black"];
B28 -> B29 [style=solid, color="black"];
B29 -> B30 [style=solid, color="black"];
B31 -> B30 [style=solid, color="black"];
B30 -> B31 [style=solid, color="black"];
B31 -> B32 [style=solid, color="black"];
B28 -> B32 [style=solid, color="black"];
}`

STUB0.parse = {
	"lines": [
		{ "file": "/g/g0/pascal/hello.c", "line": "6", "from": 4195706, "to": 4195721 },
		{ "file": "/g/g0/pascal/hello.c", "line": "7", "from": 4195721, "to": 4195726 },
		{ "file": "/g/g0/pascal/hello.c", "line": "4", "from": 4195702, "to": 4195706 },
		{ "file": "/g/g0/pascal/hello.c", "line": "8", "from": 4195726, "to": 4195728 },
		{ "file": "/g/g0/pascal/hello.c", "line": "4", "from": 4195702, "to": 4195706 },
		{ "file": "/g/g0/pascal/hello.c", "line": "6", "from": 4195706, "to": 4195721 },
		{ "file": "/g/g0/pascal/hello.c", "line": "7", "from": 4195721, "to": 4195726 },
		{ "file": "/g/g0/pascal/hello.c", "line": "8", "from": 4195726, "to": 4195728 }
	],
	"functions": [
		{ "name": "_init", "entry": 4195352,
		  "basicblocks": [
			 { "id": 0, "start": 4195352, "end": 4195368, "flags": ["memread"] },
			 { "id": 1, "start": 4195368, "end": 4195373, "flags": ["memwrite", "call"] },
			 { "id": 2, "start": 4195373, "end": 4195378, "flags": ["memread"] }
		  ],
		  "vars": [

		  ],
		  "calls": [
			{ "address": 4195368, "target": 4195440, "target_func": ["__gmon_start__"]}
		  ]
		},
		{ "name": "printf", "entry": 4195408,
		  "basicblocks": [
			 { "id": 3, "start": 4195408, "end": 4195414, "flags": ["memread"] }
		  ],
		  "vars": [

		  ],
		  "calls": [
			{ "address": 4195408, "target": 0}
		  ]
		},
		{ "name": "__libc_start_main", "entry": 4195424,
		  "basicblocks": [
			 { "id": 4, "start": 4195424, "end": 4195430, "flags": ["memread"] }
		  ],
		  "vars": [

		  ],
		  "calls": [
			{ "address": 4195424, "target": 0}
		  ]
		},
		{ "name": "__gmon_start__", "entry": 4195440,
		  "basicblocks": [
			 { "id": 5, "start": 4195440, "end": 4195446, "flags": ["memread"] }
		  ],
		  "vars": [

		  ],
		  "calls": [
			{ "address": 4195440, "target": 0}
		  ]
		},
		{ "name": "_start", "entry": 4195456,
		  "basicblocks": [
			 { "id": 6, "start": 4195456, "end": 4195497, "flags": ["memread", "memwrite", "call"] },
			 { "id": 7, "start": 4195497, "end": 4195498 }
		  ],
		  "vars": [

		  ],
		  "calls": [
			{ "address": 4195492, "target": 4195424, "target_func": ["__libc_start_main"]}
		  ]
		},
		{ "name": "deregister_tm_clones", "entry": 4195504,
		  "basicblocks": [
			 { "id": 8, "start": 4195504, "end": 4195525, "flags": ["memwrite"] },
			 { "id": 9, "start": 4195525, "end": 4195535 },
			 { "id": 10, "start": 4195535, "end": 4195543, "flags": ["memread"] },
			 { "id": 11, "start": 4195552, "end": 4195554, "flags": ["memread"] }
		  ],
		  "vars": [

		  ],
		  "calls": [
		  ]
		},
		{ "name": "register_tm_clones", "entry": 4195568,
		  "basicblocks": [
			 { "id": 12, "start": 4195568, "end": 4195603, "flags": ["memwrite"] },
			 { "id": 13, "start": 4195603, "end": 4195613 },
			 { "id": 14, "start": 4195613, "end": 4195621, "flags": ["memread"] },
			 { "id": 15, "start": 4195624, "end": 4195626, "flags": ["memread"] }
		  ],
		  "vars": [

		  ],
		  "calls": [
		  ]
		},
		{ "name": "__do_global_dtors_aux", "entry": 4195632,
		  "basicblocks": [
			 { "id": 16, "start": 4195632, "end": 4195641, "flags": ["memread"] },
			 { "id": 17, "start": 4195641, "end": 4195650, "flags": ["memwrite", "call"] },
			 { "id": 18, "start": 4195650, "end": 4195658, "flags": ["memread", "memwrite"] },
			 { "id": 19, "start": 4195658, "end": 4195660, "flags": ["memread"] }
		  ],
		  "vars": [

		  ],
		  "calls": [
			{ "address": 4195645, "target": 4195504, "target_func": ["deregister_tm_clones"]}
		  ]
		},
		{ "name": "frame_dummy", "entry": 4195664,
		  "basicblocks": [
			 { "id": 20, "start": 4195664, "end": 4195675, "flags": ["memread"] },
			 { "id": 21, "start": 4195675, "end": 4195677 },
			 { "id": 22, "start": 4195680, "end": 4195690 },
			 { "id": 23, "start": 4195690, "end": 4195696, "flags": ["memwrite", "call"] },
			 { "id": 24, "start": 4195696, "end": 4195702, "flags": ["memread"] }
		  ],
		  "vars": [

		  ],
		  "calls": [
			{ "address": 4195675, "target": 4195568, "target_func": ["register_tm_clones"]},
			{ "address": 4195694, "target": 0},
			{ "address": 4195697, "target": 4195568, "target_func": ["register_tm_clones"]}
		  ]
		},
		{ "name": "main", "entry": 4195702,
		  "basicblocks": [
			 { "id": 25, "start": 4195702, "end": 4195721, "flags": ["memwrite", "call"] },
			 { "id": 26, "start": 4195721, "end": 4195728, "flags": ["memread"] }
		  ],
		  "vars": [

		  ],
		  "calls": [
			{ "address": 4195716, "target": 4195408, "target_func": ["printf"]}
		  ]
		},
		{ "name": "__libc_csu_init", "entry": 4195728,
		  "basicblocks": [
			 { "id": 27, "start": 4195728, "end": 4195779, "flags": ["memwrite", "call"] },
			 { "id": 28, "start": 4195779, "end": 4195784 },
			 { "id": 29, "start": 4195784, "end": 4195792 },
			 { "id": 30, "start": 4195792, "end": 4195805, "flags": ["memread", "memwrite", "call"] },
			 { "id": 31, "start": 4195805, "end": 4195814 },
			 { "id": 32, "start": 4195814, "end": 4195829, "flags": ["memread"] }
		  ],
		  "vars": [

		  ],
		  "loops": [
			{ "name": "loop_1", "backedges": [ {"from": 31, "to": 30} ],
			  "blocks": [31, 30]}
		  ],
		  "calls": [
			{ "address": 4195774, "target": 4195352, "target_func": ["_init"]},
			{ "address": 4195801, "target": 0}
		  ]
		},
		{ "name": "__libc_csu_fini", "entry": 4195840,
		  "basicblocks": [
			 { "id": 33, "start": 4195840, "end": 4195842, "flags": ["memread"] }
		  ],
		  "vars": [

		  ],
		  "calls": [
		  ]
		},
		{ "name": "_fini", "entry": 4195844,
		  "basicblocks": [
			 { "id": 34, "start": 4195844, "end": 4195853, "flags": ["memread"] }
		  ],
		  "vars": [

		  ],
		  "calls": [
		  ]
		}
	]
};

STUB0.sourcefiles = [
	{ "file": "/g/g0/pascal/inputs/hello.c" },
	{ "file": "/g/g0/pascal/inputs/hello_madeup1.c" },
	{ "file": "/g/g0/pascal/inputs/hello_madeup2.c" }
];













/*
This one is from here:
/g/g0/pascal/inputs/test1.exe
/g/g0/pascal/inputs/test1.c
 */

var STUB1 = {};

STUB1.dot = `digraph g {
B0 [shape=box, style=solid, label="_init\\n0x400418: sub $0x8,%rsp\\n0x40041c: mov 0x200bd5(%rip),%rax\\n0x400423: test %rax,%rax\\n0x400426: jz 0x7(%rip) 1, 0"];
B1 [shape=box, style=solid, label="_init\\n0x400428: call 0x48(%rip) 1, 0"];
B2 [shape=box, style=solid, label="_init\\n0x40042d: add $0x8,%rsp\\n0x400431: ret near (%rsp) 1, 0"];
B3 [shape=box, style=solid, label="printf\\n0x400450: jmp 0x200bc2(%rip) 1, 0"];
B4 [shape=box, style=solid, label="__libc_start_main\\n0x400460: jmp 0x200bba(%rip) 1, 0"];
B5 [shape=box, style=solid, label="__gmon_start__\\n0x400470: jmp 0x200bb2(%rip) 1, 0"];
B6 [shape=box, style=solid, label="_start\\n0x400480: xor %ebp,%ebp\\n0x400482: mov %rdx,%r9\\n0x400485: pop %rsi\\n0x400486: mov %rsp,%rdx\\n0x400489: and $0xfffffff0,%rsp\\n0x40048d: push %rax\\n0x40048e: push %rsp\\n0x40048f: mov $0x400670,%r8\\n0x400496: mov $0x400600,%rcx\\n0x40049d: mov $0x4005bb,%rdi\\n0x4004a4: call 0xffffffbc(%rip) 1, 0"];
B7 [shape=box, style=solid, label="_start\\n0x4004a9: hlt  1, 0"];
B8 [shape=box, style=solid, label="deregister_tm_clones\\n0x4004b0: mov $0x601047,%eax\\n0x4004b5: push %rbp\\n0x4004b6: sub $0x601040,%rax\\n0x4004bc: cmp $0xe,%rax\\n0x4004c0: mov %rsp,%rbp\\n0x4004c3: jbe 0x1d(%rip) 1, 0"];
B9 [shape=box, style=solid, label="deregister_tm_clones\\n0x4004c5: mov $0x0,%eax\\n0x4004ca: test %rax,%rax\\n0x4004cd: jz 0x13(%rip) 1, 0"];
B10 [shape=box, style=solid, label="deregister_tm_clones\\n0x4004cf: pop %rbp\\n0x4004d0: mov $0x601040,%edi\\n0x4004d5: jmp %rax 1, 0"];
B11 [shape=box, style=solid, label="deregister_tm_clones\\n0x4004e0: pop %rbp\\n0x4004e1: ret near (%rsp) 1, 0"];
B12 [shape=box, style=solid, label="register_tm_clones\\n0x4004f0: mov $0x601040,%esi\\n0x4004f5: push %rbp\\n0x4004f6: sub $0x601040,%rsi\\n0x4004fd: sar $0x3,%rsi\\n0x400501: mov %rsp,%rbp\\n0x400504: mov %rsi,%rax\\n0x400507: shr $0x3f,%rax\\n0x40050b: add %rax,%rsi\\n0x40050e: sar $0x1,%rsi\\n0x400511: jz 0x17(%rip) 1, 0"];
B13 [shape=box, style=solid, label="register_tm_clones\\n0x400513: mov $0x0,%eax\\n0x400518: test %rax,%rax\\n0x40051b: jz 0xd(%rip) 1, 0"];
B14 [shape=box, style=solid, label="register_tm_clones\\n0x40051d: pop %rbp\\n0x40051e: mov $0x601040,%edi\\n0x400523: jmp %rax 1, 0"];
B15 [shape=box, style=solid, label="register_tm_clones\\n0x400528: pop %rbp\\n0x400529: ret near (%rsp) 1, 0"];
B16 [shape=box, style=solid, label="__do_global_dtors_aux\\n0x400530: cmp $0x0,0x200b09(%rip)\\n0x400537: jnz 0x13(%rip) 1, 0"];
B17 [shape=box, style=solid, label="__do_global_dtors_aux\\n0x400539: push %rbp\\n0x40053a: mov %rsp,%rbp\\n0x40053d: call 0xffffff73(%rip) 1, 0"];
B18 [shape=box, style=solid, label="__do_global_dtors_aux\\n0x400542: pop %rbp\\n0x400543: mov $0x1,0x200af6(%rip) 1, 0"];
B19 [shape=box, style=solid, label="__do_global_dtors_aux\\n0x40054a: REP ret near (%rsp) 1, 0"];
B20 [shape=box, style=solid, label="frame_dummy\\n0x400550: mov $0x600e10,%edi\\n0x400555: cmp $0x0,(%rdi)\\n0x400559: jnz 0x7(%rip) 1, 0"];
B21 [shape=box, style=solid, label="frame_dummy\\n0x40055b: jmp 0xffffff95(%rip) 1, 0"];
B22 [shape=box, style=solid, label="frame_dummy\\n0x400560: mov $0x0,%eax\\n0x400565: test %rax,%rax\\n0x400568: jz 0xfffffff3(%rip) 1, 0"];
B23 [shape=box, style=solid, label="frame_dummy\\n0x40056a: push %rbp\\n0x40056b: mov %rsp,%rbp\\n0x40056e: call %rax 1, 0"];
B24 [shape=box, style=solid, label="frame_dummy\\n0x400570: pop %rbp\\n0x400571: jmp 0xffffff7f(%rip) 1, 0"];
B25 [shape=box, style=solid, label="my_function\\n0x400576: push %rbp\\n0x400577: mov %rsp,%rbp\\n0x40057a: mov $0x400684,%edi\\n0x40057f: mov $0x0,%eax\\n0x400584: call 0xfffffecc(%rip) 1, 0"];
B26 [shape=box, style=solid, label="my_function\\n0x400589: pop %rbp\\n0x40058a: ret near (%rsp) 1, 0"];
B27 [shape=box, style=solid, label="my_b_function\\n0x40058b: push %rbp\\n0x40058c: mov %rsp,%rbp\\n0x40058f: sub $0x10,%rsp\\n0x400593: mov $0x7,0xfffffffc(%rbp)\\n0x40059a: mov $0x8,0xfffffff8(%rbp)\\n0x4005a1: mov 0xfffffffc(%rbp),%edx\\n0x4005a4: mov 0xfffffff8(%rbp),%eax\\n0x4005a7: add %edx,%eax\\n0x4005a9: mov %eax,0xfffffff4(%rbp)\\n0x4005ac: mov $0x0,%eax\\n0x4005b1: call 0xffffffc5(%rip) 1, 0"];
B28 [shape=box, style=solid, label="my_b_function\\n0x4005b6: mov 0xfffffff4(%rbp),%eax\\n0x4005b9: leave \\n0x4005ba: ret near (%rsp) 1, 0"];
B29 [shape=box, style=solid, label="main\\n0x4005bb: push %rbp\\n0x4005bc: mov %rsp,%rbp\\n0x4005bf: sub $0x10,%rsp\\n0x4005c3: mov $0x0,%eax\\n0x4005c8: call 0xffffffc3(%rip) 1, 0"];
B30 [shape=box, style=solid, label="main\\n0x4005cd: mov %eax,0xfffffffc(%rbp)\\n0x4005d0: mov $0x40069c,%edi\\n0x4005d5: mov $0x0,%eax\\n0x4005da: call 0xfffffe76(%rip) 1, 0"];
B31 [shape=box, style=solid, label="main\\n0x4005df: mov 0xfffffffc(%rbp),%eax\\n0x4005e2: cwde \\n0x4005e4: add $0x4006a8,%rax\\n0x4005ea: mov %rax,%rdi\\n0x4005ed: mov $0x0,%eax\\n0x4005f2: call 0xfffffe5e(%rip) 1, 0"];
B32 [shape=box, style=solid, label="main\\n0x4005f7: mov $0x0,%eax\\n0x4005fc: leave \\n0x4005fd: ret near (%rsp) 1, 0"];
B33 [shape=box, style=solid, label="__libc_csu_init\\n0x400600: push %r15\\n0x400602: mov %edi,%r15d\\n0x400605: push %r14\\n0x400607: mov %rsi,%r14\\n0x40060a: push %r13\\n0x40060c: mov %rdx,%r13\\n0x40060f: push %r12\\n0x400611: lea 0x2007e8(%rip),%r12\\n0x400618: push %rbp\\n0x400619: lea 0x2007e8(%rip),%rbp\\n0x400620: push %rbx\\n0x400621: sub %r12,%rbp\\n0x400624: xor %ebx,%ebx\\n0x400626: sar $0x3,%rbp\\n0x40062a: sub $0x8,%rsp\\n0x40062e: call 0xfffffdea(%rip) 1, 0"];
B34 [shape=box, style=solid, label="__libc_csu_init\\n0x400633: test %rbp,%rbp\\n0x400636: jz 0x20(%rip) 1, 0"];
B35 [shape=box, style=solid, label="__libc_csu_init\\n0x400638: nop 0x0(%rax,%rax,1) 1, 0"];
B36 [shape=box, style=solid, label="__libc_csu_init\\n0x400640: mov %r13,%rdx\\n0x400643: mov %r14,%rsi\\n0x400646: mov %r15d,%edi\\n0x400649: call 0x0(%r12,%rbx,8) 1, 0"];
B37 [shape=box, style=solid, label="__libc_csu_init\\n0x40064d: add $0x1,%rbx\\n0x400651: cmp %rbp,%rbx\\n0x400654: jnz 0xffffffec(%rip) 1, 0"];
B38 [shape=box, style=solid, label="__libc_csu_init\\n0x400656: add $0x8,%rsp\\n0x40065a: pop %rbx\\n0x40065b: pop %rbp\\n0x40065c: pop %r12\\n0x40065e: pop %r13\\n0x400660: pop %r14\\n0x400662: pop %r15\\n0x400664: ret near (%rsp) 1, 0"];
B39 [shape=box, style=solid, label="__libc_csu_fini\\n0x400670: REP ret near (%rsp) 1, 0"];
B40 [shape=box, style=solid, label="_fini\\n0x400674: sub $0x8,%rsp\\n0x400678: add $0x8,%rsp\\n0x40067c: ret near (%rsp) 1, 0"];
B33 -> B0 [style=solid, color="black"];
B0 -> B1 [style=solid, color="black"];
B1 -> B2 [style=solid, color="black"];
B0 -> B2 [style=solid, color="black"];
B25 -> B3 [style=solid, color="black"];
B30 -> B3 [style=solid, color="black"];
B31 -> B3 [style=solid, color="black"];
B6 -> B4 [style=solid, color="black"];
B1 -> B5 [style=solid, color="black"];
B6 -> B7 [style=solid, color="black"];
B17 -> B8 [style=solid, color="black"];
B8 -> B9 [style=solid, color="black"];
B9 -> B10 [style=solid, color="black"];
B9 -> B11 [style=solid, color="black"];
B8 -> B11 [style=solid, color="black"];
B21 -> B12 [style=solid, color="black"];
B24 -> B12 [style=solid, color="black"];
B12 -> B13 [style=solid, color="black"];
B13 -> B14 [style=solid, color="black"];
B13 -> B15 [style=solid, color="black"];
B12 -> B15 [style=solid, color="black"];
B16 -> B17 [style=solid, color="black"];
B17 -> B18 [style=solid, color="black"];
B11 -> B18 [style=solid, color="black"];
B16 -> B19 [style=solid, color="black"];
B18 -> B19 [style=solid, color="black"];
B20 -> B21 [style=solid, color="black"];
B22 -> B21 [style=solid, color="black"];
B20 -> B22 [style=solid, color="black"];
B22 -> B23 [style=solid, color="black"];
B23 -> B24 [style=solid, color="black"];
B27 -> B25 [style=solid, color="black"];
B25 -> B26 [style=solid, color="black"];
B29 -> B27 [style=solid, color="black"];
B27 -> B28 [style=solid, color="black"];
B26 -> B28 [style=solid, color="black"];
B29 -> B30 [style=solid, color="black"];
B28 -> B30 [style=solid, color="black"];
B30 -> B31 [style=solid, color="black"];
B31 -> B32 [style=solid, color="black"];
B33 -> B34 [style=solid, color="black"];
B2 -> B34 [style=solid, color="black"];
B34 -> B35 [style=solid, color="black"];
B35 -> B36 [style=solid, color="black"];
B37 -> B36 [style=solid, color="black"];
B36 -> B37 [style=solid, color="black"];
B37 -> B38 [style=solid, color="black"];
B34 -> B38 [style=solid, color="black"];
}`;


STUB1.parse = {
	"lines": [
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "6", "from": 4195706, "to": 4195721 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "7", "from": 4195721, "to": 4195723 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "9", "from": 4195723, "to": 4195731 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "11", "from": 4195731, "to": 4195738 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "12", "from": 4195738, "to": 4195745 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "13", "from": 4195745, "to": 4195756 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "15", "from": 4195756, "to": 4195766 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "16", "from": 4195766, "to": 4195769 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "4", "from": 4195702, "to": 4195706 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "17", "from": 4195769, "to": 4195771 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "19", "from": 4195771, "to": 4195779 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "21", "from": 4195779, "to": 4195792 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "22", "from": 4195792, "to": 4195807 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "23", "from": 4195807, "to": 4195831 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "24", "from": 4195831, "to": 4195836 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "25", "from": 4195836, "to": 4195838 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "4", "from": 4195702, "to": 4195706 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "6", "from": 4195706, "to": 4195721 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "7", "from": 4195721, "to": 4195723 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "9", "from": 4195723, "to": 4195731 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "11", "from": 4195731, "to": 4195738 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "12", "from": 4195738, "to": 4195745 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "13", "from": 4195745, "to": 4195756 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "15", "from": 4195756, "to": 4195766 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "16", "from": 4195766, "to": 4195769 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "17", "from": 4195769, "to": 4195771 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "19", "from": 4195771, "to": 4195779 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "21", "from": 4195779, "to": 4195792 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "22", "from": 4195792, "to": 4195807 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "23", "from": 4195807, "to": 4195831 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "24", "from": 4195831, "to": 4195836 },
		{ "file": "/g/g0/pascal/inputs/test1.c", "line": "25", "from": 4195836, "to": 4195838 }
	],
	"functions": [
		{ "name": "_init", "entry": 4195352,
			"basicblocks": [
				{ "id": 0, "start": 4195352, "end": 4195368, "flags": ["memread"] },
				{ "id": 1, "start": 4195368, "end": 4195373, "flags": ["memwrite", "call"] },
				{ "id": 2, "start": 4195373, "end": 4195378, "flags": ["memread"] }
			],
			"vars": [

			],
			"calls": [
				{ "address": 4195368, "target": 4195440, "target_func": ["__gmon_start__"]}
			]
		},
		{ "name": "printf", "entry": 4195408,
			"basicblocks": [
				{ "id": 3, "start": 4195408, "end": 4195414, "flags": ["memread"] }
			],
			"vars": [

			],
			"calls": [
				{ "address": 4195408, "target": 0}
			]
		},
		{ "name": "__libc_start_main", "entry": 4195424,
			"basicblocks": [
				{ "id": 4, "start": 4195424, "end": 4195430, "flags": ["memread"] }
			],
			"vars": [

			],
			"calls": [
				{ "address": 4195424, "target": 0}
			]
		},
		{ "name": "__gmon_start__", "entry": 4195440,
			"basicblocks": [
				{ "id": 5, "start": 4195440, "end": 4195446, "flags": ["memread"] }
			],
			"vars": [

			],
			"calls": [
				{ "address": 4195440, "target": 0}
			]
		},
		{ "name": "_start", "entry": 4195456,
			"basicblocks": [
				{ "id": 6, "start": 4195456, "end": 4195497, "flags": ["memread", "memwrite", "call"] },
				{ "id": 7, "start": 4195497, "end": 4195498 }
			],
			"vars": [

			],
			"calls": [
				{ "address": 4195492, "target": 4195424, "target_func": ["__libc_start_main"]}
			]
		},
		{ "name": "deregister_tm_clones", "entry": 4195504,
			"basicblocks": [
				{ "id": 8, "start": 4195504, "end": 4195525, "flags": ["memwrite"] },
				{ "id": 9, "start": 4195525, "end": 4195535 },
				{ "id": 10, "start": 4195535, "end": 4195543, "flags": ["memread"] },
				{ "id": 11, "start": 4195552, "end": 4195554, "flags": ["memread"] }
			],
			"vars": [

			],
			"calls": [
			]
		},
		{ "name": "register_tm_clones", "entry": 4195568,
			"basicblocks": [
				{ "id": 12, "start": 4195568, "end": 4195603, "flags": ["memwrite"] },
				{ "id": 13, "start": 4195603, "end": 4195613 },
				{ "id": 14, "start": 4195613, "end": 4195621, "flags": ["memread"] },
				{ "id": 15, "start": 4195624, "end": 4195626, "flags": ["memread"] }
			],
			"vars": [

			],
			"calls": [
			]
		},
		{ "name": "__do_global_dtors_aux", "entry": 4195632,
			"basicblocks": [
				{ "id": 16, "start": 4195632, "end": 4195641, "flags": ["memread"] },
				{ "id": 17, "start": 4195641, "end": 4195650, "flags": ["memwrite", "call"] },
				{ "id": 18, "start": 4195650, "end": 4195658, "flags": ["memread", "memwrite"] },
				{ "id": 19, "start": 4195658, "end": 4195660, "flags": ["memread"] }
			],
			"vars": [

			],
			"calls": [
				{ "address": 4195645, "target": 4195504, "target_func": ["deregister_tm_clones"]}
			]
		},
		{ "name": "frame_dummy", "entry": 4195664,
			"basicblocks": [
				{ "id": 20, "start": 4195664, "end": 4195675, "flags": ["memread"] },
				{ "id": 21, "start": 4195675, "end": 4195677 },
				{ "id": 22, "start": 4195680, "end": 4195690 },
				{ "id": 23, "start": 4195690, "end": 4195696, "flags": ["memwrite", "call"] },
				{ "id": 24, "start": 4195696, "end": 4195702, "flags": ["memread"] }
			],
			"vars": [

			],
			"calls": [
				{ "address": 4195675, "target": 4195568, "target_func": ["register_tm_clones"]},
				{ "address": 4195694, "target": 0},
				{ "address": 4195697, "target": 4195568, "target_func": ["register_tm_clones"]}
			]
		},
		{ "name": "my_function", "entry": 4195702,
			"basicblocks": [
				{ "id": 25, "start": 4195702, "end": 4195721, "flags": ["memwrite", "call"] },
				{ "id": 26, "start": 4195721, "end": 4195723, "flags": ["memread"] }
			],
			"vars": [

			],
			"calls": [
				{ "address": 4195716, "target": 4195408, "target_func": ["printf"]}
			]
		},
		{ "name": "my_b_function", "entry": 4195723,
			"basicblocks": [
				{ "id": 27, "start": 4195723, "end": 4195766, "flags": ["memread", "memwrite", "call"] },
				{ "id": 28, "start": 4195766, "end": 4195771, "flags": ["memread"] }
			],
			"vars": [
				{
					"name": "x", "file": "/g/g0/pascal/inputs/test1.c", "line": "11",
					"locations": [
						{ "start": "40058b", "end": "40058c", "location": "0xfffffffffffffff4(%rsp)" },
						{ "start": "40058c", "end": "40058f", "location": "0xfffffffffffffffc(%rsp)" },
						{ "start": "40058f", "end": "4005ba", "location": "0xfffffffffffffffc(%rbp)" },
						{ "start": "4005ba", "end": "4005bb", "location": "0xfffffffffffffff4(%rsp)" }
					]
				},
				{
					"name": "y", "file": "/g/g0/pascal/inputs/test1.c", "line": "12",
					"locations": [
						{ "start": "40058b", "end": "40058c", "location": "0xfffffffffffffff0(%rsp)" },
						{ "start": "40058c", "end": "40058f", "location": "0xfffffffffffffff8(%rsp)" },
						{ "start": "40058f", "end": "4005ba", "location": "0xfffffffffffffff8(%rbp)" },
						{ "start": "4005ba", "end": "4005bb", "location": "0xfffffffffffffff0(%rsp)" }
					]
				},
				{
					"name": "z", "file": "/g/g0/pascal/inputs/test1.c", "line": "13",
					"locations": [
						{ "start": "40058b", "end": "40058c", "location": "0xffffffffffffffec(%rsp)" },
						{ "start": "40058c", "end": "40058f", "location": "0xfffffffffffffff4(%rsp)" },
						{ "start": "40058f", "end": "4005ba", "location": "0xfffffffffffffff4(%rbp)" },
						{ "start": "4005ba", "end": "4005bb", "location": "0xffffffffffffffec(%rsp)" }
					]
				}
			],
			"calls": [
				{ "address": 4195761, "target": 4195702, "target_func": ["my_function"]}
			]
		},
		{ "name": "main", "entry": 4195771,
			"basicblocks": [
				{ "id": 29, "start": 4195771, "end": 4195789, "flags": ["memwrite", "call"] },
				{ "id": 30, "start": 4195789, "end": 4195807, "flags": ["memwrite", "call"] },
				{ "id": 31, "start": 4195807, "end": 4195831, "flags": ["memread", "memwrite", "call"] },
				{ "id": 32, "start": 4195831, "end": 4195838, "flags": ["memread"] }
			],
			"vars": [
				{
					"name": "result", "file": "/g/g0/pascal/inputs/test1.c", "line": "21",
					"locations": [
						{ "start": "4005bb", "end": "4005bc", "location": "0xfffffffffffffff4(%rsp)" },
						{ "start": "4005bc", "end": "4005bf", "location": "0xfffffffffffffffc(%rsp)" },
						{ "start": "4005bf", "end": "4005fd", "location": "0xfffffffffffffffc(%rbp)" },
						{ "start": "4005fd", "end": "4005fe", "location": "0xfffffffffffffff4(%rsp)" }
					]
				}
			],
			"calls": [
				{ "address": 4195802, "target": 4195408, "target_func": ["printf"]},
				{ "address": 4195826, "target": 4195408, "target_func": ["printf"]},
				{ "address": 4195784, "target": 4195723, "target_func": ["my_b_function"]}
			]
		},
		{ "name": "__libc_csu_init", "entry": 4195840,
			"basicblocks": [
				{ "id": 33, "start": 4195840, "end": 4195891, "flags": ["memwrite", "call"] },
				{ "id": 34, "start": 4195891, "end": 4195896 },
				{ "id": 35, "start": 4195896, "end": 4195904 },
				{ "id": 36, "start": 4195904, "end": 4195917, "flags": ["memread", "memwrite", "call"] },
				{ "id": 37, "start": 4195917, "end": 4195926 },
				{ "id": 38, "start": 4195926, "end": 4195941, "flags": ["memread"] }
			],
			"vars": [

			],
			"loops": [
				{ "name": "loop_1", "backedges": [ {"from": 37, "to": 36} ],
					"blocks": [37, 36]}
			],
			"calls": [
				{ "address": 4195886, "target": 4195352, "target_func": ["_init"]},
				{ "address": 4195913, "target": 0}
			]
		},
		{ "name": "__libc_csu_fini", "entry": 4195952,
			"basicblocks": [
				{ "id": 39, "start": 4195952, "end": 4195954, "flags": ["memread"] }
			],
			"vars": [

			],
			"calls": [
			]
		},
		{ "name": "_fini", "entry": 4195956,
			"basicblocks": [
				{ "id": 40, "start": 4195956, "end": 4195965, "flags": ["memread"] }
			],
			"vars": [

			],
			"calls": [
			]
		}
	]
};


STUB1.sourcefiles = [
	{"file": "/g/g0/pascal/inputs/test1.c"},
	{"file": "/g/g0/pascal/inputs/test1a.c"}
];