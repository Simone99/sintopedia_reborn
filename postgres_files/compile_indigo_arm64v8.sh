repo="https://github.com/epam/Indigo"
postgres_major_version="17"
postgres_version="$postgres_major_version.6"
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

echo "Compiling bingo-postgres, indigo-python and indigo-wasm..."

docker pull arm64v8/debian:latest
docker run --rm \
           -v "$DIR":/output \
           arm64v8/debian:latest \
           /bin/sh \
           -c "apt-get update && \
            apt-get upgrade -y && \
            apt install -y wget git build-essential cmake libpq-dev pkg-config libicu-dev bison flex zlib1g-dev gettext libreadline-dev libncursesw5-dev libssl-dev libsqlite3-dev tk-dev libgdbm-dev libc6-dev libbz2-dev libffi-dev && \
            wget https://www.python.org/ftp/python/3.9.23/Python-3.9.23.tgz && \
            tar -xzvf Python-3.9.23.tgz && \
            cd Python-3.9.23 && \
            ./configure --enable-optimizations && \
            make -j $(nproc) && \
            make install && \
            cd .. && \
            rm -rf Python-3.9.23 Python-3.9.23.tgz && \
            wget -P pg https://ftp.postgresql.org/pub/source/v$postgres_version/postgresql-$postgres_version.tar.gz && \
            tar -xzvf ./pg/postgresql-$postgres_version.tar.gz && \
            cd postgresql-$postgres_version && \
            ./configure --without-readline --enable-nls && \
            make -j $(nproc) && \
            make install && \
            cd .. && \
            rm -rf pg postgresql-$postgres_version && \
            git clone $repo && \
            cd Indigo && \
            mkdir build && \
            cd build && \
            cmake .. -DBUILD_BINGO_POSTGRES=ON -DBUILD_BINGO_SQLSERVER=OFF -DBUILD_BINGO_ORACLE=OFF -DBUILD_INDIGO=OFF -DBUILD_INDIGO_WRAPPERS=OFF -DBUILD_INDIGO_UTILS=OFF -DBUILD_BINGO_ELASTIC=OFF -DCMAKE_PREFIX_PATH=/usr/local/pgsql && \
            cmake --build . --config $config --target package-bingo-postgres -- -j $(nproc) && \
            cp /Indigo/dist/bingo-postgres$postgres_major_version-*.tgz /output && \
            cd .. && \
            rm -rf build && \
            python3 -m pip install -r api/python/requirements_dev.txt --break-system-packages && \
            python3 -m pip install wheel --break-system-packages && \
            mkdir build && \
            cd build && \
            cmake .. -DBUILD_INDIGO=ON -DBUILD_INDIGO_UTILS=ON -DBUILD_BINGO=OFF -DBUILD_BINGO_ELASTIC=OFF && \
            cmake --build . --config $config --target indigo-python -- -j $(nproc) && \
            cp ../dist/epam_indigo-*-none-*.whl /output && \
            cd .. && \
            rm -rf build && \
            cd .. && \
            git clone https://github.com/emscripten-core/emsdk.git && \
            cd emsdk && \
            ./emsdk install 3.1.60 && \
            ./emsdk activate 3.1.60 && \
            chmod 755 ./emsdk_env.sh && \
            ./emsdk_env.sh && \
            cd .. && \
            cd Indigo && \
            mkdir build && \
            cd build && \
            emcmake cmake .. -DCMAKE_BUILD_TYPE=$config && \
            cmake --build . --config $config --target indigo-ketcher-package -- -j $(nproc) && \
            cp ../dist/indigo-ketcher-*.tgz /output
           "

git clone https://github.com/epam/ketcher "$DIR/ketcher"
cd "$DIR/ketcher"
npm i
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
sudo sh -c "rm indigo-ketcher-*.tgz"