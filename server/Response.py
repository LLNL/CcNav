# Response.py
import json


class Response:
    def __init__(self):
        self = self
        self.things = {}


    def respond(self):

        str_things = json.dumps( self.things )

        print("Content-type: application/json")
        print("")
        print(str_things)


    def add(self, label, thing):
        self.things[label] = thing


res = Response()
