#!/usr/global/tools/lorenz/python/optvis-env2/bin/python

import sys
import cgi

sys.path.append('../server')

import GetFileChoices

parameter = cgi.FieldStorage()
input_files = parameter.getvalue('input_files')

GetFileChoices.getJSONTexts( input_files )