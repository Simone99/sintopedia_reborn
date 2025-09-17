repo="https://github.com/epam/Indigo"
postgres_major_version="17"
config=Debug

# Set the directory you want to clean
DIR="$(pwd)/dist"

# Check if the directory exists
if [ -d "$DIR" ]; then
    # Check if the directory is not empty
    if [ "$(ls -A $DIR)" ]; then
        echo "Removing all files in $DIR..."
        rm -rf "$DIR"/*
    else
        echo "$DIR is already empty."
    fi
else
    echo "Directory $DIR does not exist, creating..."
    mkdir $DIR
fi

# Bingo-postgres

echo "Compiling bingo-postgres..."

docker pull epmlsop/buildpack-almalinux8:latest
docker run --rm \
           -v "$DIR":/output \
           epmlsop/buildpack-almalinux8:latest \
           /bin/sh \
           -c " set -eux && \
                ulimit -n 1024 && \
                yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-8-x86_64/pgdg-redhat-repo-latest.noarch.rpm && \
                curl -OL https://download.postgresql.org/pub/repos/yum/keys/PGDG-RPM-GPG-KEY-RHEL && \
                rpm --import PGDG-RPM-GPG-KEY-RHEL && \
                yumdownloader -y postgresql$postgres_major_version-devel && \
                rpm -i --nodeps postgresql$postgres_major_version*.rpm && \
                ls -alh /usr && \
                export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:/opt/rh/httpd24/root/usr/lib64 && \
                git clone $repo && \
                cd Indigo && \
                mkdir build && \
                cd build && \
                cmake .. -DBUILD_BINGO_POSTGRES=ON -DBUILD_BINGO_SQLSERVER=OFF -DBUILD_BINGO_ORACLE=OFF -DBUILD_INDIGO=OFF -DBUILD_INDIGO_WRAPPERS=OFF -DBUILD_INDIGO_UTILS=OFF -DBUILD_BINGO_ELASTIC=OFF -DCMAKE_PREFIX_PATH=/usr/pgsql-$postgres_major_version && \
                cmake --build . --config $config --target package-bingo-postgres -- -j $(nproc) && \
                cp /Indigo/dist/bingo-postgres$postgres_major_version-*.tgz /output"

# Indigo-python

echo "Compiling indigo-python..."

docker pull epmlsop/indigo-tester:latest
docker run \
    --rm \
    -v "$DIR":/output \
    epmlsop/indigo-tester:latest \
    sh -c "
        git clone $repo &&
        cd Indigo &&
        python3 -m pip install -r api/python/requirements_dev.txt --break-system-packages &&
        mkdir build &&
        cd build &&
        cmake .. -DBUILD_INDIGO=ON -DBUILD_INDIGO_UTILS=ON -DBUILD_BINGO=OFF -DBUILD_BINGO_ELASTIC=OFF &&
        cmake --build . --config $config --target indigo-python -- -j $(nproc) &&
        cp ../dist/epam_indigo-*-none-manylinux1_x86_64.whl /output
    "

Ketcher and indigo-wasm

echo "Compiling ketcher and indigo-wasm..."

docker pull emscripten/emsdk:3.1.60
docker run \
    --rm \
    -v "$DIR":/output \
    emscripten/emsdk:3.1.60 \
    sh -c "
        git clone $repo &&
        cd Indigo &&
        mkdir build &&
        cd build &&
        emcmake cmake .. -DCMAKE_BUILD_TYPE=$config &&
        cmake --build . --config $config --target indigo-ketcher-package -- -j $(nproc) &&
        cp ../dist/indigo-ketcher-*.tgz /output
    "
sh -c "tar -xvf $DIR/indigo-ketcher-*.tgz -C $DIR"
git clone https://github.com/epam/ketcher "$DIR/ketcher"
cd "$DIR/ketcher"
npm i
sh -c "rm ./node_modules/indigo-ketcher/* && cp ../package/* ./node_modules/indigo-ketcher/"
cd ./packages/ketcher-core
npm run build
cd ../ketcher-react
npm run build
cd ../ketcher-macromolecules
npm run build
cd ../ketcher-standalone
npm run build
cd ../../example
npm run init:build
npm run init:dist
npm run build:standalone
cd $DIR
rm ../../public/asset-manifest.json
rm ../../public/iframe.html
rm ../../public/index.html
rm ../../public/manifest.json
rm ../../public/robots.txt
rm -R ../../public/static
cp ./ketcher/example/build/asset-manifest.json ../../public
cp ./ketcher/example/build/iframe.html ../../public
cp ./ketcher/example/build/index.html ../../public
cp ./ketcher/example/build/manifest.json ../../public
cp ./ketcher/example/build/robots.txt ../../public
mkdir ../../public/static
mkdir ../../public/static/css
mkdir ../../public/static/js
sh -c "cp ./ketcher/example/build/static/css/* ../../public/static/css && \
       cp ./ketcher/example/build/static/js/* ../../public/static/js"
sudo rm -R ketcher
sudo rm -R package
sudo sh -c "rm indigo-ketcher-*.tgz"