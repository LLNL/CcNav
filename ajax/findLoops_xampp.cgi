#!/Library/Frameworks/Python.framework/Versions/3.7/bin/python3

# !/usr/bin/python

import sys
import os

sys.path.append('../')
sys.path.append('../server')

from detector import *

input_text_from_fe = sys.stdin.read()
# print(input_text_from_fe)

loops = findLoops(input_text_from_fe)

print("Content-type: application/json")
print("")

print(loops)
