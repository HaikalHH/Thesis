FROM node:20-bullseye

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    libreoffice \
    fonts-noto \
    fonts-noto-cjk \
    fonts-dejavu \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install --no-frozen-lockfile

COPY . .

RUN pnpm build && pnpm prune --prod

USER node

EXPOSE 3001

CMD ["node", "dist/server.js"]
