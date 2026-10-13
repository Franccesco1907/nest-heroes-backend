# Heroes Backend

NestJS REST API for a hero catalog. Data starts from `src/data/heroes.data.ts` and is stored in memory; changes disappear on restart.

## Run and check

Use Node.js 20+ and the committed npm lockfile.

```sh
npm ci
npm run start:dev
```

The default port is 3000 (override with `PORT`). Routes start at `/api/heroes`: list/create, `summary`, `search` and read/update/delete by ID or slug. Static assets are served from `public`.

Run `npm test -- --runInBand` for service regressions and `npm run build` to compile. `npm run start:prod` serves the compiled output. The `test:e2e` script references a configuration absent from this repository.

License metadata in `package.json`: `UNLICENSED`. NestJS itself is MIT licensed.
