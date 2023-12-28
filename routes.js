'use strict';
module.exports = function(app) {
  let productsCtrl = require('index.js');

  // todoList Routes
  app.route('/').post(productsCtrl.store);

};
