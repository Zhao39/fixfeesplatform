import cookieParser from 'cookie-parser'
import express from 'express'
import logger from 'morgan'
import path from 'path'
import formidable from 'express-formidable'

import { BACKEND_LOCATION, MODELS_DIR, ROUTES_DIR } from '../var/env.config'
import { globFiles } from '../helpers/misc'
import '../helpers/logger'

const app: express.Express = express()

//for cros origin
app.use(function (req, res, next) {
  //res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE, PUT')
  res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization, X-Request-With, X-CLIENT-ID, X-CLIENT-SECRET')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  next()
})

let modelsDir = MODELS_DIR
if (modelsDir === "") {
  modelsDir = "./dist/models/**/*.js"
}

//console.log("----------modelsDir------------", modelsDir)
for (const model of globFiles(modelsDir)) {
  //console.log("model:::::", model)
  require(path.resolve(model))
}

//DB && connect(DB)

app.set('views', path.join(__dirname, '../../src/views'))
app.set('view engine', 'pug')

if (BACKEND_LOCATION === "localhost") {
  app.use(logger('dev'))
}

app.use(formidable({ multiples: true, maxFileSize: 9900000000000 })); //////////////////////
// app.use(express.json())
// app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '../../src/public')))
//app.use('/uploads/ticket', express.static(path.join(__dirname, '../../src/public/uploads/ticket')));

//console.log('----------ROUTES_DIR------------', ROUTES_DIR)
let routesDir = ROUTES_DIR
if (routesDir === "") {
  routesDir = "./dist/routes/**/*.js"
}

for (const route of globFiles(routesDir)) {
  //console.log("route:::::", route)
  require(path.resolve(route)).default(app)
}

// startShopifyCheckoutCron() //will not use any more

export default app
