import os

from google.appengine.ext import vendor

# https://cloud.google.com/appengine/docs/python/tools/using-libraries-python-27

# Add any libraries installed in the "lib" folder.
# In unit tests, the current working directory can be different. To avoid errors, we explicitly
# pass in the full path to the lib folder
lib_path = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'libs')
vendor.add(lib_path)
