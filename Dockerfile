ARG SERVICE_NAME="dynamic-reporting"
ARG SERVICE_VERSION="0.0.7"
ARG BUILD_DATE
ARG BUILD_REF

# Stage 1: Build
FROM node:23.6.1-alpine3.20 AS build

# Set working directory
WORKDIR /app

# Copy the project files
COPY . .

# Install dependencies and build the React apps
RUN npm i && \
 npm run build && \
 chmod +x /app/copyReportMenus.sh && \
 # Run the script to copy report_menu.json files
 /bin/sh /app/copyReportMenus.sh

# Stage 2: Deployment
FROM nginx:1.27.3-alpine
ARG SERVICE_NAME
ARG SERVICE_VERSION
ARG BUILD_DATE
ARG BUILD_REF

WORKDIR /usr/share/nginx/html

# Copy the build files from the build stage
COPY --from=build /app/build apps/

COPY nginx/default_local.conf /etc/nginx/conf.d/default.conf

RUN chown root:root /etc/nginx/conf.d/default.conf

LABEL \
    maintainer="LineMetrics <engineering@linemetrics.com>" \
    name="${SERVICE_NAME}" \
    version="${SERVICE_VERSION}" \
    org.label-schema.description="${SERVICE_NAME}" \
    org.label-schema.name="${SERVICE_NAME}" \
    org.label-schema.schema-version="1.0" \
    org.label-schema.build-date="${BUILD_DATE}" \
    org.label-schema.url="https://www.linemetrics.com/" \
    org.label-schema.usage="https://www.linemetrics.com/" \
    org.label-schema.vcs-ref="${BUILD_REF}" \
    org.label-schema.vcs-url="https://gitlab.linemetrics.com/LineMetrics/Frontend-Services/in-app-dynamic-reporting" \
    org.label-schema.vendor="LineMetrics"
