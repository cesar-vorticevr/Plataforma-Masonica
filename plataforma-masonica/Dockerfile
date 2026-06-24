# Imagen de DESARROLLO de la app Next.js (hot reload vía bind mount en docker-compose).
# No es una imagen de producción: el despliegue productivo es Vercel (Opción A).
# Node 22 alpine cumple el piso de Next 16 (node >=20.9).
FROM node:22-alpine

WORKDIR /app

# Instala dependencias primero para aprovechar la caché de capas.
COPY package.json package-lock.json ./
RUN npm ci

# Copia el código (en dev, docker-compose lo sobre-monta por bind mount para hot reload).
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
