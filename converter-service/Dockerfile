FROM node:20-bullseye

ENV DEBIAN_FRONTEND=noninteractive

RUN set -eux; \
    echo "deb http://deb.debian.org/debian bullseye main contrib non-free" > /etc/apt/sources.list.d/fonts.list; \
    echo "deb http://deb.debian.org/debian-security bullseye-security main contrib non-free" >> /etc/apt/sources.list.d/fonts.list; \
    echo "deb http://deb.debian.org/debian bullseye-updates main contrib non-free" >> /etc/apt/sources.list.d/fonts.list; \
    apt-get update; \
    apt-get install -y --no-install-recommends debconf-utils; \
    echo "ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true" | debconf-set-selections; \
    apt-get install -y --no-install-recommends \
      libreoffice \
      libreoffice-java-common \
      fonts-noto \
      fonts-noto-cjk \
      fonts-dejavu \
      fonts-liberation \
      ttf-mscorefonts-installer \
      default-jre-headless; \
    apt-get purge -y --auto-remove debconf-utils; \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install --no-frozen-lockfile

COPY . .

RUN pnpm build && pnpm prune --prod

USER node

EXPOSE 3001

CMD ["node", "dist/server.js"]
