rm -rf dist
npx concurrently "nx run xws:build" "cd apps/core; make all -j 3"
cp -r dist/apps/xws dist/apps/XWebStack
echo "PORT=19090" > dist/apps/XWebStack/config
root=$(pwd)
cd dist/apps/ && zip -r xws.zip XWebStack && cd $root
