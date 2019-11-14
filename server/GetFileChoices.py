# GetFileChoices

import os
import sys
import json
import Response
from pprint import pprint

#vi hello.c
# 1002  gcc hello.c
# 1003  gcc -g hello.c
# 1004  ls a.out
# 1005  ./a.out
# 1006  cd /usr/gapps/spot/optvis/
# 1007  ls
# 1008  ./optparser.py open ~/a.out
# 1009  ./optparser.py dot /var/tmp/pascal/optvis_8cm_nh07
# 1010  history
# 1011  ./optparser.py parse /var/tmp/pascal/optvis_8cm_nh07
# 1012  ./optparser.py sourcefiles /var/tmp/pascal/optvis_8cm_nh07
# 1013  history
# ./optparser.py close /var/tmp/pascal/optvis_8cm_nh07
# ./optparser.py --help



def getFiles():

    #  eventually the FE will provide the location of the executable
    cmd = "./optparser ./libtest.so"
    #os.system(cmd)

    #  Read in the lulesh.o.json file
    file = open('../sample_inputs/lulesh.o.json')
    read = file.read()

    input_files = {}
    input_files["f_dot"] = "../sample_inputs/lulesh.o.dot"
    input_files["f_src"] = "../sample_inputs/lulesh.cc"
    input_files["f_json"] = "../sample_inputs/lulesh.o.json"

    #  Parse It into JSON
    decoded = json.loads(read)

    #  Send it to the FE, to be represented as a select drop down.
    res = Response.res
    res.add('json', decoded)
    res.add('input_files', input_files )
    res.respond()


def getJSONTexts( input_files ):

    input_files = json.loads(input_files)

    #pprint( input_files )
    #sys.stderr.write('spam' + input_files["f_dot"])

    # TODO: For now we just return hard coded.
    # TODO: Send back based on the choice the user made.
    f_src_file = open(input_files["f_src"])
    f_dot_file = open(input_files["f_dot"])
    f_json_file = open(input_files["f_json"])

    res = Response.res
    res.add('f_src', f_src_file.read())
    res.add('f_dot', f_dot_file.read())
    res.add('f_json', f_json_file.read())

    res.respond()
