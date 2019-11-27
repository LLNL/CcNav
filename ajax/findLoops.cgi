#!/usr/global/tools/lorenz/python/narf-env/bin/python

#/usr/global/web-pages/lc/www/lorenz_base/dev/pascal/narf/env5/bin/python

import sys
import os

sys.path.append('../')
sys.path.append('../server')

from detector import *

input_text_from_fe = sys.stdin.read()

loops = findLoops(input_text_from_fe)


print("Content-type: application/json")
print("")
#print(input_text_from_fe)
print(loops)
