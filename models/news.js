import { Schema, model, models } from 'mongoose';

const NewsSchema = new Schema({
  news: {
    type: String,
    required: [true, 'News is required.'],
  },
  tag: {
    type: String,
    required: [true, 'desc is required.'],
  }
});

const News = models.News || model('News', NewsSchema);

export default News;