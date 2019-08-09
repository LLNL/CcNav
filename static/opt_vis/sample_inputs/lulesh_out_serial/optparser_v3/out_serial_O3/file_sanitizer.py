import re
import sys
import string

if(len(sys.argv) != 2):
	print ("Usage: python3 name_sanitizer.py filename")
	exit()
	
filename = sys.argv[1]
print( "Sanitizing file " + filename)

outfilename = "out_" + filename 	

with open(filename, 'r', encoding='ISO-8859-1') as file:
	input_str = file.read()

# pattern = r'[^a-zA-Z0-9 _\-\:<>,()*&~[\]\s{}]'
pattern = r'[^a-zA-Z0-9\s"!#$%&\'()*+,\-./:;<=>?@[\]^_`{|}~]'

# pattern = string.printable
# pattern = "r'[^" + pattern + "]'" 
print(pattern)

new_str = re.sub(pattern, "", input_str)

#write the string to the new file
with open(outfilename, 'w') as file:
	file.write(new_str)