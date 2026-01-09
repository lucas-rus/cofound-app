# Stage 1: Build the React application
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# We need to pass the API URL at build time for Vite
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# Stage 2: Serve the static files using a simple Node server
# (Using 'serve' package is better than 'vite preview' for production-like serving)
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 3000
# Railway passes PORT, serve uses it if configured or defaults
CMD serve -s dist -l ${PORT:-3000}
