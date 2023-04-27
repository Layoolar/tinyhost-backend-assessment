'use strict'

const upload = require('./upload');

const express = require("express");

// Initialisation
const router = new express.Router();
const paths = {
  index: '/'
};

// Routing
router.post("/upload", upload);

// Export
module.exports = {
  router,
  paths
};
