# =====================================================================
# LogiTrack Frontend - Dockerfile multi-stage (LT4-30)
#
# Etapa 1 (build): usa Node para instalar dependencias y compilar la SPA
#                  (genera la carpeta /app/dist con HTML, JS y CSS).
# Etapa 2 (serve): parte de una imagen limpia de Nginx y copia SOLO dist/.
#                  La imagen final no tiene Node, ni node_modules, ni src/.
#
# Versiones de imagen fijas (no "latest" ni "24-alpine") para que todos
# construyan exactamente lo mismo.
# =====================================================================

# ---------- Etapa 1: compilar ----------
FROM node:24.22.2-alpine AS build
WORKDIR /app

# Primero solo los archivos de dependencias: si no cambian, Docker reutiliza
# la capa de "npm ci" desde la cache y el build tarda segundos.
COPY package.json package-lock.json .npmrc ./
# npm ci instala EXACTAMENTE lo que dice package-lock.json
RUN npm ci

# Ahora el resto del codigo
COPY . .

# Las variables VITE_* se escriben dentro del JavaScript AL COMPILAR,
# por eso se pasan como build-arg (no como variable de entorno al arrancar).
# Es la URL que usa el NAVEGADOR, por eso es localhost y no "api-gateway".
ARG VITE_API_BASE_URL=http://localhost:8066
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ---------- Etapa 2: servir ----------
FROM nginx:1.28.3-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
