# GetFileChoices

import os
import json
import Response

def getFiles():

    #  eventually the FE will provide the location of the executable
    cmd = "./optparser ./libtest.so"
    #os.system(cmd)

    #  Read in the lulesh.o.json file
    file = open('../sample_inputs/lulesh.o.json')
    read = file.read()

    #  Parse It into JSON
    decoded = json.loads(read)

    #  Send it to the FE, to be represented as a select drop down.
    res = Response.res
    res.add('json', decoded)
    res.respond()


def getJSONTexts( choices ):

    # TODO: For now we just return hard coded.
    # TODO: Send back based on the choice the user made.
    f_src_file = open('../sample_inputs/lulesh.cc')
    f_dot_file = open('../sample_inputs/lulesh.o.dot')
    f_json_file = open('../sample_inputs/lulensh.o.json')

    res = Response.res
    res.add('f_src', f_src_file.read())
    res.add('f_dot', f_dot_file.read())
    res.add('f_json', f_json_file.read())

    res.respond()
