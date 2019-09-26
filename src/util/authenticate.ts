import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import consts from './consts';
import asyncHandler from './errorHandler';
import validate from './apiValidator';
import User from '../model/user';
import getLogger from './logger';

const router = express.Router();
const logger = getLogger(__filename.slice(__dirname.length + 1, -3));

router.post(
  '/register',
  validate([
    body('username')
      .exists()
      .withMessage('username required'),
    body('password')
      .exists()
      .withMessage('password required')
  ]),
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    const hashCost = 10;
    try {
      const hashedPassword = await bcrypt.hash(password, hashCost);
      // first user will become admin
      let role = consts.roles.user;
      const hasUser = await User.findOne({});
      if (!hasUser) {
        role = consts.roles.admin;
      }
      const newUser = new User({ username, role, hashedPassword });
      await newUser.save();
      logger.debug(`New user ${newUser.username} registered`);
      res.status(200).send('register successful');
    } catch (err) {
      logger.error(err);
      res.status(400);
    }
  })
);

router.post(
  '/login',
  validate([
    body('username')
      .exists()
      .withMessage('username required'),
    body('password')
      .exists()
      .withMessage('password required')
  ]),
  (req, res) => {
    passport.authenticate('local', { session: false }, (error, user) => {
      if (error || !user) {
        return res.status(400).json(`${error}`);
      }

      // Content of the Jwt
      const payload = {
        username: user.username,
        expires: Date.now() + parseInt(process.env.JWT_EXPIRATION_MS, 10)
      };

      // assigns payload to req.user
      req.login(payload, { session: false }, err => {
        if (err) {
          return res.status(400).send(`${err}`);
        }
        // sign the Jwt token and send it to the response
        const token = jwt.sign(JSON.stringify(payload), process.env.SECRET);

        logger.debug(`Generated jwt toke: ${token}`);
        // store Jwt token in cookie */
        res.cookie('jwt', token, { httpOnly: true });
        return res.status(200).send('login successful');
      });

      logger.debug(`User ${req.user.username} logged in`);
      return null;
    })(req, res);
  }
);

router.get('/logout', (req, res) => {
  req.logout();
  res.clearCookie('jwt', { httpOnly: true });
  if (req.user) {
    logger.debug(`User ${req.user.username} logged out`);
  }
  res.status(200).send('logout successful');
});

export default router;
