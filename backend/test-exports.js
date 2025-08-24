const paymentController = require('./controllers/paymentController');
console.log('Available functions in paymentController:');
console.log(Object.keys(paymentController));
console.log('getPaymentStats:', typeof paymentController.getPaymentStats);
console.log('getAllPayments:', typeof paymentController.getAllPayments);
console.log('getPaymentById:', typeof paymentController.getPaymentById);
