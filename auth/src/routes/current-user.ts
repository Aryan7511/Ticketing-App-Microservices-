import express from 'express';
import { currentUser } from '@sswaptickets/common';

const router = express.Router();

router.get(
  '/api/users/currentuser',
  currentUser,
  (req, res, next) => {
    res.send({ currentUser: req.currentUser || null });
  }
);

export { router as currentUserRouter };
