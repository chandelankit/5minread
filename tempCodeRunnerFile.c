// Online C compiler to run C program online
#include <stdio.h>

int main() {
    
    unsigned char ch = 0;
    int count = 0;
    while(++ch <= 255){
        count++;
    }
    printf("%d",count);

    return 0;
}