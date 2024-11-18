#!/usr/bin/env bash

set -euo pipefail

if ! [ -f ./package.json ]; then
  printf "\x1b[1;31mNot in a node project! exiting...\x1b[0m\n"
  exit 1
fi

printStage() {
  printf "\x1b[1;97m$1\x1b[0m\n"
}

printStage "Migrating project:"

printStage "* Deleting old health check files"
rm -f \
  server/data/healthCheck.ts \
  server/data/healthCheck.test.ts \
  server/services/healthCheck.ts \
  server/services/healthCheck.test.ts

printStage "* Ensuring productId is mandatory in ApplicationInfo"
sed -i '' "s/productId?/productId/g" server/applicationInfo.ts

printStage "* Replace healthcheck middleware"
cat > server/middleware/setUpHealthChecks.ts <<EOL
import express, { Router } from 'express'

import { monitoringMiddleware, endpointHealthComponent } from '@ministryofjustice/hmpps-monitoring'
import type { ApplicationInfo } from '../applicationInfo'
import logger from '../../logger'
import config from '../config'

export default function setUpHealthChecks(applicationInfo: ApplicationInfo): Router {
  const router = express.Router()

  const apiConfig = Object.entries(config.apis)

  const middleware = monitoringMiddleware({
    applicationInfo,
    healthComponents: apiConfig.map(([name, options]) => endpointHealthComponent(logger, name, options)),
  })

  router.get('/health', middleware.health)
  router.get('/info', middleware.info)
  router.get('/ping', middleware.ping)

  return router
}
EOL

printStage "* Installing new library"
npm install @ministryofjustice/hmpps-monitoring

printStage "* Manual steps"
echo "
 Now:   
- Add 'healthPath' keys to each API config in 'config.ts' for the path where the health check endpoint exists.
- Check health check coverage - this only attempts to hook up health checks for APIs defined in config, any custom health checks will need to be re-added.
- Run integration tests see if you need to add missing stubbing for APIs that previously had no health checks.
"
