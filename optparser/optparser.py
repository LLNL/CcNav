#!/usr/bin/python3

import argparse
import os
import sys
import tempfile
import subprocess

optparser_paths = [ "/usr/gapps/spot/optvis/toss_3_x86_64_ib/bin/optparser" ]

op_in = None
op_out = None
op_err = None
key = None

class TeardownError(Exception):
    def __init__(self, msg):
        self.msg = msg

def teardown():
    if key and op_in:
        op_in.write("close")

    if key:
        for f in ["fifo0", "fifo1", "fifo2", "target", None]:
            try:
                if f:
                    os.unlink(os.path.join(key, f))
                else:
                    os.rmdir(key)
            except:
                pass
        
def openOptparserFiles():
    global op_in
    global op_out
    global op_err
    
    try:
        fifo0file = os.path.join(key, "fifo0") #stdin
        fifo1file = os.path.join(key, "fifo1") #stdout
        fifo2file = os.path.join(key, "fifo2") #stderr    
        op_in = open(fifo0file, "w", buffering=1)
        op_out = open(fifo1file, "r")
        op_err = open(fifo2file, "r")
        return op_in, op_out, op_err
    except Exception:
        raise TeardownError("Error: Optparser session %s closed.  Try reopening." % key)

def collectInput():
    try:
        for line in op_out:
            if line == "OPTPARSER OPERATION DONE\n":
                break            
            sys.stdout.write(line)
    except Exception:
        raise TeardownError("Error: Could not read from optparser at %s." % key)

def openFile(args):
    global key
    executablepath = args.filepath
    fifo0file = ""
    fifo1file = ""
    fifo2file = ""
    linkfile = ""
    try:
        key = tempfile.mkdtemp(prefix="optvis_")
        fifo0file = os.path.join(key, "fifo0") #stdin
        fifo1file = os.path.join(key, "fifo1") #stdout
        fifo2file = os.path.join(key, "fifo2") #stderr
        linkfile = os.path.join(key, "target")        
        os.mkfifo(fifo0file, mode=0o600)
        os.mkfifo(fifo1file, mode=0o600)
        os.mkfifo(fifo2file, mode=0o600)
        os.symlink(executablepath, linkfile)
    except:
        raise TeardownError("Error: Failed to make temporary fifos in %s" % key)


    optparser = ""
    for path in optparser_paths:
        actualpath = os.path.expandvars(path)
        if not os.path.exists(actualpath):
            continue
        if not os.access(actualpath, os.X_OK):
            continue
        optparser = actualpath
    if not optparser:
        raise TeardownError("Error: Failed to find optparser.  Tried: %s" % str(optparser_paths))
    try:
        args = [optparser, "--interactive", key, linkfile]
        subprocess.Popen(args)
    except:
        raise TeardownError("Error: Failed to execute optparser at %s\n" % optparser)

    openOptparserFiles()
    op_in.write("open\n")

    collectInput()
    print(key)

def parse(args):
    openOptparserFiles()
    op_in.write("parse\n")
    collectInput()

def dot(args):
    openOptparserFiles()
    op_in.write("dot\n")
    collectInput()

def sourcefiles(args):
    openOptparserFiles()    
    op_in.write("sourcefiles\n")
    collectInput()

def keepalive(args):
    openOptparserFiles()
    op_in.write("keepalive\n")
    collectInput()

def close(args):
    openOptparserFiles()
    teardown()

parser = argparse.ArgumentParser(description="OptParser binary parser for OptVis")
subparsers = parser.add_subparsers(dest="sub_name")

open_sub = subparsers.add_parser("open")
open_sub.add_argument("filepath", help="Open executable file or shared library and return a key")
open_sub.set_defaults(func=openFile)

parse_sub = subparsers.add_parser("parse")
parse_sub.add_argument("key", help="Print binary parse of key")
parse_sub.set_defaults(func=parse)

dot_sub = subparsers.add_parser("dot")
dot_sub.add_argument("key", help="Print binary parse of key")
dot_sub.set_defaults(func=dot)

sourcefiles_sub = subparsers.add_parser("sourcefiles")
sourcefiles_sub.add_argument("key", help="Print the list of sourcefiles of a key")
sourcefiles_sub.set_defaults(func=sourcefiles)

keepalive_sub = subparsers.add_parser("keepalive")
keepalive_sub.add_argument("key", help="Keep the server associated with the keep alive")
keepalive_sub.set_defaults(func=keepalive)

close_sub = subparsers.add_parser("close")
close_sub.add_argument("key", help="Close the binary associated with a key")
close_sub.set_defaults(func=close)

args = parser.parse_args()
if "key" in args:
    key = args.key

try:
    args.func(args)
except TeardownError as e:
    print(e.msg)
    teardown()

