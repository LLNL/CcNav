
#include <stdio.h>
#include "source0.c"
#include "source1.c"
#include "source2.c"

int main() {

  source0();
  source1();
  printf("hello world\r\n");
  source2();

  return 0;
}
