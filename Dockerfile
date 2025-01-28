ARG SERVICE_NAME="dynamic-reporting"
ARG SERVICE_VERSION="0.0.1"

# Stage 1: Build
FROM node:23.6.1-alpine3.20 AS build

# Set working directory
WORKDIR /app

# Copy the project files
COPY . .

# Install dependencies and build the React apps
RUN npm i && npm run build

# Copy the bash script to the container
COPY copyReportMenus.sh /app/

# Make the script executable
RUN chmod +x /app/copyReportMenus.sh

# Run the script to copy report_menu.json files
RUN /bin/sh /app/copyReportMenus.sh

# Stage 2: Deployment
FROM nginx:1.27.3-alpine
ARG SERVICE_NAME SERVICE_VERSION

# Copy the build files from the build stage
COPY --from=build /app/build /usr/share/nginx/html

ENV SERVICE_NAME=$SERVICE_NAME
ENV SERVICE_VERSION=$SERVICE_VERSION
LABEL \
    maintainer="LineMetrics <engineering@linemetrics.com>" \
    name="${SERVICE_NAME}" \
    version="${SERVICE_VERSION}" \
    org.label-schema.description="${SERVICE_NAME}" \
    org.label-schema.name="${SERVICE_NAME}" \
    org.label-schema.schema-version="1.0" \
    org.label-schema.url="https://www.linemetrics.rocks/" \
    org.label-schema.usage="https://www.linemetrics.rocks/" \
    org.label-schema.vcs-url="https://gitlab.linemetrics.com/LineMetrics/Frontend-Services/in-app-dynamic-reporting" \
    org.label-schema.vendor="LineMetrics"
