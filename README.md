## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Prisma guide

### Install Prisma

```bash
$ pnpm add prisma @prisma/client
```

### Generate Prisma schema

The below command will generate a 'schema.prisma' file. However, I have already done that, so you don't need to do so. Just keep the command in mind in case unexpected occurs.

```bash
# initialize schema with this command
$ npx prisma init

# or this instead
$ prisma init
```

### Prisma setup

```bash
# run migration with this command
$ npx prisma migrate dev

# or this instead
$ prisma migrate dev
```

### Generate

Only do this if the import process of '@prisma/client' is not working. You will need to change the imports from "... from '@prisma/client'" to "... from 'generated/prisma'".

```bash
# generate dependencies with this command
$ npx prisma generate

# or this instead
$ prisma generate
```

### Reset migrations

This will allow you to reset migrations in necessary scenarios, in which will reset ALL data. Do this with cautions.

```bash
# reset migrations with this command
$ npx prisma migrate reset

# or this instead
$ prisma migrate reset
```

## Other specifications

### About database

Database recommendation is PostgreSQL, not MongoDB. Since we have many roles, including Admin, we need to change to SQL-like database for easier database queries. <i>This note will be deleted in the final MVP.</i>

I'm running on local database, and on the way to migrate this to AWS S3 bucket with remote database.

### Access Token & Refresh Token

Please generate your own access token and refresh token online. Add them to '.env' file.

### Backend guide

All the necessary API routes are created. Also I have already done a bit of the API handling setups in the FE repository. Please check the 'website-FE' for more information. <i>This note will also be deleted in the final MVP.</i>
