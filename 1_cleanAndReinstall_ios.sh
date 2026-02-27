
echo "yarn.lock deleted"
rm yarn.lock 

echo "node_module deleted"
rm -rf ./node_modules

cd ios

echo "Podfile.lock deleted"
rm Podfile.lock

echo "Pods deleted"
rm -rf ./Pods

echo "Xcode workspace deleted"
rm -rf ./FrqtalPortal.xcworkspace

echo "ios build deleted"
rm -rf ./build

echo "pod cache cleared"
bundle exec pod cache clean --all

echo "Pod caches deleted"
rm -rf ~/Library/Caches/CocoaPods

echo "Xcode derived data deleted"
read -p "¿Quieres ejecutar el comando 11? (y/n): " respuesta
if [[ "$respuesta" == "y" ]]; then
    rm -rf ~/Library/Developer/Xcode/DerivedData/*
else
    echo "Comando omitido."
    exit 1
fi

echo "Pods deintegrated"
bundle exec pod deintegrate

echo "Setting up Pods"
bundle exec pod setup

cd ..

echo "Installing app dependencies"
yarn cache clean
yarn

cd ios

echo "Installing dependencies"
bundle exec pod install --repo-update
