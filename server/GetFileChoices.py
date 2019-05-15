# GetFileChoices

import os
import Response

def getFiles():

    #  eventually the FE will provide the location of the executable
    cmd = "./optparser ./libtest.so"
    #os.system(cmd)

    dict = {}
    dict['sam'] = 4
    dict['sim'] = "asdfasdf"

    res = Response.res
    res.add('dict', dict)
    res.respond()
