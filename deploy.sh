#! /bin/bash

cd docs
rm -rf *
cd ..

hugo

git add .
git commit -m "$(date "+%Y-%m-%d %H:%M:%S")"
git push

