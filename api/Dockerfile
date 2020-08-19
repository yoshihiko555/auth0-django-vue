FROM python:3

# バイナリレイヤ下の標準出力とエラー出力を抑制する環境変数
ENV PYTHONUNBUFFERED 1

WORKDIR /usr/src/auth/api

RUN apt-get update
RUN apt-get install -y --no-install-recommends \
	net-tools \
	sudo \
	bzip2 \
	curl \
	gcc \
	git \
	python3-dev \
	vim
RUN apt-get clean

ADD . .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
