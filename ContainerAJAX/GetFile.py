#!/usr/bin/python3

import sys
import cgi

sys.path.append('../server')

import GetFileChoices

see_sourcecode = parameter.getvalue('see_sourcecode')

GetFileChoices.getFile( see_sourcecode )