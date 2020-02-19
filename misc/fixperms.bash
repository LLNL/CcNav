#!/bin/bash

chmod 755 index.html
chmod 755 js/*.js
chmod 755 static/opt_vis/*.js
chmod -R 755 static/opt_vis
chmod -R 755 sample_inputs

chmod 755 css
chmod 755 css/*.css
chmod 755 static/opt_vis/*.css

cd ..
#  Set permissions to these and any other directories: js server scss img deploy
chmod 755 `find . \( ! -regex '.*/\..*' \) -type d`;

#  Change files to 644.
chmod 644 `find . -name '*.html' -o -name '*.css' -o -name '*.js' -o -name 'README' -o -name '*.png' -o -name '*.jpg' -o -name '*.tmpl'`


# this needs to be executable otherwise we get an internal server error.
chmod 755 `find . -name '*.cgi' -o -name '*.pm' -o -name '*.bash' -o -name 'test-rest'`
#chmod 755 `find -name '*.py' -o -name '*.pyc'`

#chgrp -R lorenz *

cd ..
# this is the newly created osb directory repo name.
# without this permission you get a permission error on osb/
chmod 755 optvis
