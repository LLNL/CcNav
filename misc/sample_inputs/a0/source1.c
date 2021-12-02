
int source1() {
  printf("i am source0\r\n");

  int x;

  for( x=0; x < 5; x++ ) {
    loopme1();
  }
}

int loopme1() {
  printf("loopme1: i am being looped\r\n");
}

