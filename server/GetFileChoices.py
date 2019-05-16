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
    decoded = json.loads(read)

    #  Parse It into JSON


    #  Send it to the FE, to be represented as a select drop down.


    dict = {}
    dict['sam'] = 4
    dict['sim'] = "asdfasdf"

    res = Response.res
    res.add('json', decoded)
    res.respond()
