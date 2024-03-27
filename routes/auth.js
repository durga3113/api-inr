require('../settings');
const { sendMessage } = require('../Baileys/whatsapp.js');
const passport = require('passport');
require('../controller/passportLocal')(passport);
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const isGmail = require('is-gmail')
const resetToken = require('../model/resetTokens');
const user = require('../model/user');
const dataweb = require('../model/DataWeb');
const mailer = require('../controller/sendMail');
const bcryptjs = require('bcryptjs');
const passwordValidator = require('password-validator');
const generateApiKey = require('generate-api-key').default;
const containsEmoji = require('contains-emoji');
const Recaptcha = require('express-recaptcha').RecaptchaV2;
const recaptcha = new Recaptcha(recaptcha_key_1, recaptcha_key_2);
const OTP = require('../model/otp');
const { sendOTPEmail } = require('../controller/sendotp');


async function updateUserCount() {
    try {
        const totalUsers = await user.countDocuments();
        await dataweb.findOneAndUpdate({}, { totalUsers: totalUsers }, { upsert: true });
        console.log('Total users count updated successfully.');
    } catch (error) {
        console.error('Error updating total users count:', error);
    }
}

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        next();
    } else {
        req.flash('error_messages', "Please Login to continue !");
        res.redirect('/login');
    }
}

 function captchaForgotPassword(req, res, next) {
    if (req.recaptcha.error) {
        req.flash('error_messages','reCAPTCHA Invalid');
        res.redirect('/forgot-password');
    } else {
        return next();
   }
}

function captchaResetPassword(req, res, next) {
    const { token } = req.body;
    if (req.recaptcha.error) {
        req.flash('error_messages','reCAPTCHA Invalid');
        res.redirect(`/reset-password?token=${token}`);
    } else {
        return next();
   }
}

function captchaRegister(req, res, next) {
    if (req.recaptcha.error) {
        req.flash('error_messages','reCAPTCHA Invalid');
        res.redirect('/signup');
    } else {
        return next();
   }
}

 function captchaLogin(req, res, next) {
    if (req.recaptcha.error) {
        req.flash('error_messages','reCAPTCHA Invalid');
        res.redirect('/login');
    } else {
        return next();
    }
 }

 function generateOTP() {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
//_______________________ ┏ Router ┓ _______________________\\


router.get('/login', recaptcha.middleware.render, (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect("/docs");
    } else {
        res.render("login", { 
            csrfToken: req.csrfToken(),
            recaptcha: res.recaptcha
        });
    }
    
});


router.post('/login', recaptcha.middleware.verify, captchaLogin, (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/login');
        }
        if (!user.isVerified) {
            return res.redirect('/getotp');
        }
        req.logIn(user, async (err) => {
            if (err) {
                return next(err);
            }
            return res.redirect('/docs');
        });
    })(req, res, next);
});

router.get('/signup', recaptcha.middleware.render, (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect("/docs");
    } else {
        res.render("signup", { 
            csrfToken: req.csrfToken(),
            recaptcha: res.recaptcha
         });
    }
});

router.post('/signup', recaptcha.middleware.verify, captchaRegister, async (req, res) => {
    const { email, username, password, confirmpassword, phoneNumber } = req.body;
    var createpw = new passwordValidator();
    createpw.is().min(8).is().max(30).has().uppercase().has().lowercase().has().digits().has().not().spaces().is().not().oneOf(['Passw0rd', 'Password123']);

    var checkpw = createpw.validate(password)

    if (!usetempemail) {
        var checkemail = await isGmail(email)
    } else {
        var checkemail = true
    }

    if (!email || !username || !password || !confirmpassword || !phoneNumber) {
        req.flash('error_messages', 'All Fields Required !');
        return res.redirect('/signup');
    } else if (password != confirmpassword) {
        req.flash('error_messages', "Password Don't Match !");
        return res.redirect('/signup');
    } else if (!checkpw) {
        req.flash('error_messages', "Password Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters,no emoji and no Space Limit 30 text");
        return res.redirect('/signup');
    } else if (containsEmoji(password)) {
        req.flash('error_messages', "Password Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters,no emoji and no Space Limit 30 text");
        return res.redirect('/signup');
    } else if (username.length < 4) {
        req.flash('error_messages', "Username must be at least 4 characters");
        return res.redirect('/signup');
    } else if (username.length > 20) {
        req.flash('error_messages', "Username limit cannot be more than 20 characters");
        return res.redirect('/signup');
    } else if (containsEmoji(username)) {
        req.flash('error_messages', "Username Can't use emoji");
        return res.redirect('/signup');
    } else if (!checkemail) {
        req.flash('error_messages', "Sorry we only accept Gmail Accounts for now");
        return res.redirect('/signup');
    } else {
        try {
            const existingUser = await user.findOne({ $or: [{ email: email }, { username: username }, { phoneNumber: phoneNumber }] });
            if (existingUser) {
                req.flash('error_messages', "User Exists, Try Logging In !");
                return res.redirect('/login');
            }
            const salt = await bcryptjs.genSalt(12);
            const hash = await bcryptjs.hash(password, salt);
            const apikey = generateApiKey({ method: 'bytes', length: 8 });
            const newUser = new user({
                username: username,
                email: email,
                password: hash,
                apikey: apikey,
                phoneNumber: phoneNumber,
                limitApikey: LimitApikey
            });
            await newUser.save();
            await updateUserCount();
            req.flash('success_messages', "Account Created. Please choose method to get otp.");
            res.redirect('/getotp');
        } catch (error) {
            console.error('Error in signup:', error);
            req.flash('error_messages', 'An error occurred during registration. Please try again later.');
            res.redirect('/signup');
        }
    }
});


router.get('/verify', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect("/docs");
    } else {
        res.render("verify");
    }
});

router.get('/verify-otp', async (req, res) => {
    const otp = req.query.otp; 
    try {
        const otpData = await OTP.findOneAndDelete({ otp: otp });
        if (otpData) {
            const userData = await user.findOne({ email: otpData.email });
            if (userData) {
                userData.isVerified = true;
                await userData.save();
                console.log("User verified successfully");
                req.flash('success_messages', 'Email Verified Successfully');
                return res.redirect('/login');
            } else {
                console.log("User not found");
                req.flash('error_messages', 'User not found');
                return res.redirect('/login');
            }
        } else {
            console.log("Invalid OTP");
            req.flash('error_messages', 'Invalid OTP');
            return res.redirect('/login');
        }
    } catch (error) {
        console.error('Error in verifying email:', error);
        req.flash('error_messages', 'An error occurred while verifying email. Please try again later.');
        return res.redirect('/login');
    }
});

router.get('/getotp', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect("/docs");
    } else {
        res.render("getotp");
    }
});

router.get('/get-otp', async (req, res) => {
    const { content } = req.query;

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const phoneRegex = /^[0-9\-\+\(\) ]{6,}$/;

    let method;

    if (emailRegex.test(content)) {
        method = 'email';
    } else if (phoneRegex.test(content)) {
        method = 'whatsapp';
    } else {
	req.flash('error_messages', "Invalid info. Please provide a valid email or  whatsapp phone number.");
        return res.redirect('/getotp');
    }

    try {
        let existingUser;
        if (method === 'email') {
            existingUser = await user.findOne({ email: content });
        } else if (method === 'whatsapp') {
            existingUser = await user.findOne({ phoneNumber: content });
        }

        if (!existingUser) {
            return res.redirect('/signup');
        }

        const otp = generateOTP();
        const newOTP = new OTP({
            [method === 'email' ? 'email' : 'phoneNumber']: content,
            otp: otp,
            creationDate: new Date(),
            expiryDate: new Date(Date.now() + 15 * 60 * 1000)
        });
        await newOTP.save();

        if (method === 'email') {
            await sendOTPEmail(content, otp);
        } else if (method === 'whatsapp') {
            const sock = req.app.get('whatsappSock');
       await sendMessage(sock, content, `*ALPHA-API* *VERIFICATION*\n\nYour OTP for verification is: *${otp}*\nplease use within 15 minutes of getting this message\n\n*made with ❤️ by Cipher*`);
        }

        return res.redirect('/verify');
    } catch (error) {
       req.flash('error_messages', "Error in getting otp please try another method");
        return res.redirect('/getotp');
    }
});


router.get('/forgot-password', recaptcha.middleware.render, async (req, res) => {
    res.render('forgot-password.ejs',  { 
        csrfToken: req.csrfToken(),
        recaptcha: res.recaptcha
     });

});

router.post('/forgot-password', recaptcha.middleware.verify, captchaForgotPassword, async (req, res) => {
    const { email } = req.body;

	if (!email ) {
        req.flash('error_messages','All Fields Required !');
        res.redirect('/forgot-password');
    }
    var userData = await user.findOne({ email: email });
    var Cooldown = await resetToken.findOne({ email: email });

if (userData) {
if (Cooldown) {
    req.flash('error_messages','Please Dont Spam Wait After 30 minutes after new submit.');
    res.redirect('/forgot-password')
            
 }else{
            var token = crypto.randomBytes(32).toString('hex');
            var mail = await mailer.sendResetEmail(email, token)
            if(mail == 'error'){
                req.flash('error_messages','Error Please Try Again Tomorrow');
                res.redirect('/forgot-password');
            }else{
             await resetToken({ token: token, email: email }).save();
            req.flash('success_messages','Check your email for more info, wait 30 minutes after new submit.');
            res.redirect('/forgot-password');    
            }
           
 }
    } else {
        req.flash('error_messages','No user Exists with this email');
        res.redirect('/forgot-password');
    }
});

router.get('/reset-password', recaptcha.middleware.render, async (req, res) => {
    const token = req.query.token;

    if (token) {
        var check = await resetToken.findOne({ token: token });
        if (check) {
            res.render('forgot-password.ejs',  { 
                csrfToken: req.csrfToken(),
                recaptcha: res.recaptcha,
                reset: true,
                email: check.email,
                token: token
             });
        } else {
            req.flash('error_messages','Token Tampered or Expired.');
            res.redirect('/forgot-password');
        }
    } else {
        res.redirect('/login');
    }

});


router.post('/reset-password', recaptcha.middleware.verify, captchaResetPassword, async (req, res) => {
    const { password, confirmpassword, email, token } = req.body;
    var resetpw = new passwordValidator();
resetpw
.is().min(8)                                   
.is().max(30)                                 
.has().uppercase()                              
.has().lowercase()                              
.has().digits()                               
.has().not().spaces()                           
.is().not().oneOf(['Passw0rd', 'Password123']);

var checkpw = resetpw.validate(password)

    if (!password || !confirmpassword || confirmpassword != password) {
        req.flash('error_messages',"Passwords Don't Match !");
        res.redirect(`/reset-password?token=${token}`);
    } else if(!checkpw) {
        req.flash('error_messages',"Password Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters,no emoji and no Space Limit 30 text");
        res.redirect(`/reset-password?token=${token}`);
    } else {
        var salt = await bcryptjs.genSalt(12);
        if (salt) {
            var hash = await bcryptjs.hash(password, salt);
            await user.findOneAndUpdate({ email: email }, { $set: { password: hash } });
            await resetToken.findOneAndDelete({ token: token });
            req.flash('success_messages', 'Password Has Change')
            res.redirect('/login');
        } else {
        req.flash('error_messages',"Unexpected Error Try Again");
        res.redirect(`/reset-password?token=${token}`);
        }
    }
});


module.exports = router;
