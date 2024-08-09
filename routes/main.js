__path = process.cwd();
require('../settings');
const express = require('express');
const router = express.Router();
const passport = require('passport');
require('../controller/passportLocal')(passport);
const authRoutes = require('./auth');
const apiRoutes = require('./api');
const dataweb = require('../model/DataWeb');
const User = require('../model/user');

// Increment visitor count if IP is not already recorded
async function VisitorsCount(ip) {
  try {
    const data = await dataweb.findOne({});
    
    if (!data.ipAddresses.includes(ip)) {
      await dataweb.updateOne({}, { 
        $inc: { visitors: 1 }, 
        $push: { ipAddresses: ip } 
      });
    }
  } catch (error) {
    console.error('Error incrementing visitors count:', error);
  }
}

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        next();
    } else {
        req.flash('error_messages', "Please Login to continue!");
        res.redirect('/login');
    }
}

async function getApikey(id) {
  let limit = await dataweb.findOne();
  let users = await User.findOne({ _id: id });
  return {
      apikey: users.apikey,
      username: users.username,
      checklimit: users.limitApikey,
      isVerified: users.isVerified,
      RequestToday: limit.RequestToday,
      totalUsers: limit.totalUsers,
      totalRequests: limit.totalRequests,
      visitors: limit.visitors
  };
}

async function getApiStats() {
  let limit = await dataweb.findOne();
  await updateUserCount();
  return {
    totalUsers: limit.totalUsers,
    totalRequests: limit.totalRequests,
    RequestToday: limit.RequestToday,
    visitors: limit.visitors
  };
}

async function updateUserCount() {
  try {
      const totalUsers = await User.countDocuments();
      await dataweb.findOneAndUpdate({}, { totalUsers: totalUsers }, { upsert: true });
  } catch (error) {
      console.error('Error updating total users count:', error);
  }
}

// Middleware to count unique visitors
const incviscnt = async (req, res, next) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    await VisitorsCount(ip);
  } catch (error) {
    console.error('Error incrementing visitors count:', error);
  }
  next();
};

//_______________________ ┏ Router ┓ _______________________\\

router.get('/', incviscnt, (req, res) => {
    res.render("home");
});

router.get('/wiki', incviscnt, async (req, res) => {
  let getinfo = await getApiStats();
  let { totalUsers, totalRequests, RequestToday, visitors } = getinfo;
  res.render("dash", { totalUsers: totalUsers, totalRequests: totalRequests, visitors: visitors, RequestToday: RequestToday });
});

router.get('/docs', checkAuth, async (req, res) => {
  let getinfo = await getApikey(req.user.id);
  let { apikey, username, checklimit, isVerified, RequestToday, visitors } = getinfo;
  res.render("docs", { username: username, verified: isVerified, apikey: apikey, visitors: visitors, limit: checklimit, RequestToday: RequestToday });
});

router.get("/logout", (req, res) => {
  req.logout(req.user, err => {
    if(err) return next(err);
    res.redirect("/wiki");
  });
});

router.use(authRoutes);
router.use(apiRoutes);

module.exports = router;
