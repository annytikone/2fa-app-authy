const authy = require('authy')('KSizd76WM3IQa9ycGH2jtrCbOK7VG4bA');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = 8080;

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Test' });
});

// register user on Authy
router.post('/register', (req, res) => {
  console.log('New register request...');

  const { email, phone, countryCode } = req.body;

  authy.register_user(email, phone, countryCode, (regErr, regRes) => {
    console.log('In Registration...');
    if (regErr) {
      console.log(regErr);
      res.send('There was some error registering the user.');
    } else if (regRes) {
      console.log(regRes);
      authy.request_sms(regRes.user.id, (smsErr, smsRes) => {
        console.log('Requesting SMS...');
        if (smsErr) {
          console.log(smsErr);
          res.send('There was some error sending OTP to cell phone.');
        } else if (smsRes) {
          console.log(smsRes);
          res.send('OTP Sent to the cell phone.');
        }
      });
    }
  });
});

// Verify User Using OTP
router.post('/verify', (req, res) => {
  console.log('New verify request...');
  const { userId: id, token } = req.body;

  authy.verify(id, token, (verifyErr, verifyRes) => {
    console.log('In Verification...');
    if (verifyErr) {
      console.log(verifyErr);
      res.send('OTP verification failed.');
    } else if (verifyRes) {
      console.log(verifyRes);
      res.send('OTP Verified.');
    }
  });
});

// view status of user after verification
router.post('/status', (req, res) => {
  console.log('View Status...');
  const { userId: id } = req.body;

  authy.user_status(id, (err, response) => {
    console.log('In Status ...');
    if (err) {
      console.log(err);
      res.send('Something Went Wrong in User Status.');
    } else if (response) {
      console.log(response);
      res.json(response);
    }
  });
});

app.use('/api', router);

app.listen(port);

console.log('Server started on port ' + port);
