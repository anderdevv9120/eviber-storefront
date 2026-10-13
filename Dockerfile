FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS dependencies
RUN yarn

FROM dependencies AS build
COPY . ./
# Theme theo khách (thư mục trong src/themes) — next.config.mjs đọc lúc build
ARG THEME=rosier
ENV THEME=$THEME
RUN yarn build
RUN ls -la /app  # Add this line

# --- Release with Alpine ----
FROM node:20-alpine AS release
WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules 
COPY --from=build /app/.next ./.next
EXPOSE 3001
CMD ["yarn", "start", "-p", "3001"]
