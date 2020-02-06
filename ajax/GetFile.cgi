#!/usr/global/tools/lorenz/python/optvis-env2/bin/python

import sys
import cgi

sys.path.append('../server')

import GetFileChoices

parameter = cgi.FieldStorage()
see_sourcecode = parameter.getvalue('see_sourcecode')

GetFileChoices.getFile( see_sourcecode )