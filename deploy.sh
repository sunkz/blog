#! /bin/bash

hugo

cd ./public

rm -rf .git

git init
git remote add origin git@github.com:sunkz/blog.git
git add .
git commit -m "$(date "+%Y-%m-%d %H:%M:%S")"
git push -f --set-upstream origin main

rm -rf *
rm -rf .git

cd ..

git add .
git commit -m "$(date "+%Y-%m-%d %H:%M:%S")"
git push
