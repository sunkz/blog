#! /bin/bash

cd docs
rm -rf *
cd ..

hugo server -D
