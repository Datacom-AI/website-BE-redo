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

## Other specifications

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

Only do this if the import process of '@prisma/client' is not working. You will need to change the imports to "... from '@prisma/client'" to "... from 'generated/prisma'"

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
