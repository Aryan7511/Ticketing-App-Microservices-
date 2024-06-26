import mongoose from 'mongoose';

// Interface that describes the properties required to create a new Ticket
interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
}

// Interface that describes the properties that a Ticket Document has
interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  userId: string;
}

// Interface that describes the properties that a Ticket Model has
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    // Configure the schema to transform the returned JSON object
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

// Static method to create a new ticket and enforce TypeScript checking
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

// Create the Ticket model with the defined schema and interfaces
const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };