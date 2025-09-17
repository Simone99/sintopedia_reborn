# FROM postgres:17.6
FROM arm64v8/postgres:17.6

COPY ./dist/bingo-postgres17-linux-*.tgz /opt/
COPY ./dist/epam_indigo-*.whl /opt/
# COPY ./init_db_tables_functions.sql /opt/

RUN cd /opt/ && \
    tar -xzf bingo-postgres17*.tgz && \
    mv /opt/bingo-postgres*/ /opt/bingo-postgres/ && \
    cd /opt/bingo-postgres && \
    sh ./bingo-pg-install.sh -libdir /opt/bingo-postgres/lib -y && \
    chown postgres:postgres /opt/bingo-postgres/lib/libbingo-postgres.so && \
    cp /opt/bingo-postgres/bingo_install.sql /docker-entrypoint-initdb.d/ && \
    # cp /opt/init_db_tables_functions.sql /docker-entrypoint-initdb.d/ && \
    rm /opt/bingo-postgres*.tgz && \
    apt update && \
    apt install -y python3 python3-pip postgresql-plpython3-17 && \
    pip install /opt/epam_indigo-*.whl --break-system-packages
# Debug
# apt install -y gdb postgresql-17-dbgsym procps git && \
# cd / &&\
# git clone https://github.com/epam/Indigo