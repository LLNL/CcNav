#include <stdio.h>

int buffer[1024][1024];

static int mult1(int x, int y)
{
   return (x+1)+(y+1);
}

static int mult2(int x, int y)
{
   return (x+1)*(y+1);
}

static int mult3(int x, int y)
{
   return (x-1)*(y-1);
}

static int dosum(int a, int b)
{
   int result = mult1(a, b);
   result += mult2(a, b);
   result += mult3(a, b);
   return result;
}

void *doloop(int i)
{
   int x, y;
   for (y = 0; y < 1024; y++) {
      for (x = 0; x < 1024; x++) {
         buffer[y][x] = dosum(x*i, y*i);
      }
   }
   return (void*) buffer;
}
