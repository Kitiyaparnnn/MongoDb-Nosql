const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const package = require('./AllPackages')

const app = express();

app.use(bodyParser.json())
