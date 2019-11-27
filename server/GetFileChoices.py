# GetFileChoices

import os
import sys
import json
import Response
from pprint import pprint





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



def getFile( see_sourcecode ):

    file = open(see_sourcecode)
    read = file.read()

    res = Response.res
    res.add('see_sourcecode', read )
    res.respond()
