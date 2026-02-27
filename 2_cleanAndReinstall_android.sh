cd android

echo "gladle deleted"
rm -rf .gradle/

echo "idea deleted"
rm -rf .idea/

echo "build/ deleted"
rm -rf build/

echo "app/bulid/ deleted"
rm -rf app/build/

echo "app/.cxx/ deleted"
rm -rf app/.cxx/

echo "pod cache cleared"
./gradlew clean

cd ..
