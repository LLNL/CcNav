#!/usr/global/tools/lorenz/python/narf-env/bin/python

import sys
import cgi

sys.path.append('../server')

import GetFileChoices

parameter = cgi.FieldStorage()
see_sourcecode = parameter.getvalue('see_sourcecode')

GetFileChoices.getFile( see_sourcecode )