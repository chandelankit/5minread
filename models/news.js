import { Schema, model, models } from 'mongoose';

const NewsSchema = new Schema({
  news: {
    type: String,
    required: [true, 'News is required.'],
  },
  tag: {
    type: String,
    required: [true, 'desc is required.'],
  },
  newsimg: {
    type: String,
    required: [true, 'newsSrc is required'],
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  downvotes: {
    type: Number,
    default: 0,
  },
  votedUsers: {
    type: Map,
    of: String, // store user ID -> 'up' or 'down'
    default: {},
  },
}, { timestamps: true });

const News = models.News || model('News', NewsSchema);

export default News;
