import express, { Request, Response, NextFunction } from 'express';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get(
  '/api/tickets',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tickets = await Ticket.find({});

      res.send(tickets);
    } catch (error) {
      next(error);
    }
  }
);

export { router as indexTicketRouter };
