#include<iostream>

void printMe(){
	printf("This is printMe function\n");
}

int sum(int a, int b){
	printMe();
	return a+b;
}

int multiply(int a, int b){
	printMe();
	return a*b;
}

int simple(int a, int b){
	int c = sum(a,b);
	int d = multiply(a,b);
	return c+d;
}

float floatLoop(float d){
	float result = 0.0;
	for(int i=0; i<10; i++){
		result += i*d;
	}
	return result;
}

int nestedLoops(int a, int b){
	int result = 0;
	for(int i=0; i<a; i++){
		result += 5*i;
		for(int j=0; j<b; j++){
			result += 2*i*j;
		}
	}
	return result;
}

void foo(){
	
	printf("This is foo function\n");
	printMe();
	
	float d=10.0, e;
	e = floatLoop(d);
	
	printf("%f\n", e);

}


int main(){

	printf("This is main function\n");

	foo();

	// perform some computations
	float poly = 0;
	float x = 2.3;
	poly = 3*x*x + 2*x + 1;
	
	printf("%f\n", poly);

	int a=5, b=10, c;
	c = nestedLoops(a,b);
	printf("%d\n", c);

	int d = simple(2,3);
	printf("%d\n", d);
	return 0;
}








