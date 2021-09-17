#! /usr/bin/env python

from flask import Flask, render_template, request
import detector
import time
import os
import subprocess
import pickle
import json

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 50 * 8 * 1024 * 1024 # 50 MB Limit

@app.route('/')
def optvis():
  return render_template('optVIS.html')

@app.route('/1/')
def optvis1():
  return render_template('optVIS1.html')

@app.route('/2/')
def optvis2():
  return render_template('optVIS_collapsible_tree.html')

@app.route('/3/')
def optvis3():
  return render_template('optVIS_collapsible_tree_small_nodes.html')

@app.route('/4/')
def optvis4():
  return render_template('optVIS_collapsible_tree_2.html')

@app.route('/5/')
def optvis5():
  return render_template('optVIS_collapsible_tree_2_small_nodes.html')

@app.route('/6/')
def optvis6():
  return render_template('optVIS_with_mvc.html')

@app.route('/7/')
def optvis7():
  return render_template('goldenlayouttest.html') 

@app.route('/8/')
def optvis8():
  return render_template('optVIS_with_mvc_goldenlayout_stackbar.html')

@app.route('/test/')
def test():
	return render_template('test.html')

@app.route('/optvis/')
def optvis_mvc():
  return render_template('index.html')

@app.route('/findLoops/', methods=['GET', 'POST'])
def findLoops():
  if request.method=='POST':
    data = request.data.decode('utf-8')
  else:
    #Only for testing purpose
    # with open('opt.43.dot', 'r') as myfile:
    #     data = myfile.read()
    return
  return detector.findLoops(data)



