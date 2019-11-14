import re
import sys

if(len(sys.argv) != 2):
	print ("Usage: python3 latindecoder.py filename")
	exit()
	
filename = sys.argv[1]
print( "Decoding latin file " + filename)

outfilename = "decoded_" + filename 	

with open(filename, 'r', encoding='ISO-8859-1') as file:
	input_str = file.read()

new_str = str(input_str.encode('utf8'))

# write the string to the new file
with open(outfilename, 'w') as file:
	file.write(new_str)