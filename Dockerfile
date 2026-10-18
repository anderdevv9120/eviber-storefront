ARG THEME=court
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN HUSKY=0 npm ci
COPY . .
ARG THEME
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SHOWCASE_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_BRAND_NAME
ARG NEXT_PUBLIC_BRAND_TAGLINE
ARG NEXT_PUBLIC_BRAND_DESCRIPTION
ENV THEME=$THEME \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SHOWCASE_API_URL=$NEXT_PUBLIC_SHOWCASE_API_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_BRAND_NAME=$NEXT_PUBLIC_BRAND_NAME \
    NEXT_PUBLIC_BRAND_TAGLINE=$NEXT_PUBLIC_BRAND_TAGLINE \
    NEXT_PUBLIC_BRAND_DESCRIPTION=$NEXT_PUBLIC_BRAND_DESCRIPTION \
    NEXT_TELEMETRY_DISABLED=1
RUN : "${NEXT_PUBLIC_SHOWCASE_API_URL:-${NEXT_PUBLIC_API_URL:?Set --build-arg NEXT_PUBLIC_SHOWCASE_API_URL}}" "${NEXT_PUBLIC_SITE_URL:?Set --build-arg NEXT_PUBLIC_SITE_URL}"
RUN npm run build && npm prune --omit=dev --ignore-scripts

FROM node:24-alpine AS release
WORKDIR /app
ARG THEME
ENV NODE_ENV=production PORT=3001 THEME=$THEME NEXT_TELEMETRY_DISABLED=1
COPY --from=build --chown=node:node /app/package.json /app/package-lock.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/next.config.mjs ./next.config.mjs
# next.config.mjs validates the selected theme when next start loads it.
COPY --from=build --chown=node:node /app/src/themes ./src/themes
USER node
EXPOSE 3001
CMD ["node", "node_modules/next/dist/bin/next", "start"]
