FROM mcr.microsoft.com/azure-functions/node:4-node18

# Install Playwright dependencies
RUN apt-get update && \
    apt-get install -y wget gnupg ca-certificates && \
    apt-get install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libxcomposite1 libxrandr2 libxdamage1 libxss1 libasound2 libxshmfence1 libgbm1 libgtk-3-0 libx11-xcb1 && \
    apt-get clean

COPY . /home/site/wwwroot
WORKDIR /home/site/wwwroot

RUN npm install
RUN npx playwright install --with-deps