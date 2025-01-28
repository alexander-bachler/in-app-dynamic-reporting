# Stage 1: Build
FROM node:alpine AS build
LABEL authors="mike"

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
FROM nginx:alpine
LABEL authors="mike"

# Copy the build files from the build stage
COPY --from=build /app/build /usr/share/nginx/html