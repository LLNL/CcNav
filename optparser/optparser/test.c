#include <unistd.h>
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

void noinline_function(int i)
{
   printf("top %d\n", i);
   if (i != 0)
      noinline_function(i - 1);
   printf("bottom %d\n", i);
}

void *doloop(int i)
{
   int x, y, z;
   printf("At top of doloop\n");
   getpid();
   for (y = 0; y < 1024; y++) {
      for (x = 0; x < 1024; x++) {
         buffer[y][x] = dosum(x*i, y*i);
      }
      for (z = 0; z < 512; z++) {
         buffer[z][z] = buffer[z][z]+1;
      }
      for (z = 0; z < 256; z++) {
         buffer[z+1][z] = buffer[z][z]+1;
      }
   }
   for (y = 0; y < 1024; y++) {
      for (x = 0; x < 1024; x++) {
         buffer[y][x] = buffer[y][x] - 1;
      }
   }
   noinline_function(i);
   return (void*) buffer;
}
