int loopme() {
  printf("i am being looped\r\n");
}

int source0() {
  printf("i am source0\r\n");

  int x;

  for( x=0; x < 5; x++ ) {
    loopme();
  }
}

