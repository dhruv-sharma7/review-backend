const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
const Review = require('./models/review');
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb+srv://dhruv722202:Hello121@cluster0.gdkgkm0.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Failed to connect to MongoDB', error);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.use(express.static('public'));
app.use(express.json());

app.get('/api/reviews', (req, res) => {
  const { page, pageSize, sortBy } = req.query;
  const pageNumber = parseInt(page) || 1;
  const itemsPerPage = parseInt(pageSize) || 10;

  const skipCount = (pageNumber - 1) * itemsPerPage;

  const sortCriteria = {};
  if (sortBy === 'date') {
    sortCriteria.createdAt = -1;
  } else if (sortBy === 'rating') {
    sortCriteria.rating = -1;
  }

  Promise.all([
    Review.find().countDocuments(),
    Review.find().sort(sortCriteria).skip(skipCount).limit(itemsPerPage),
  ])
  .then(([totalReviews, reviews]) => {
    const totalPages = Math.ceil(totalReviews / itemsPerPage);

    res.status(200).json({
      reviews,
      totalPages,
    });
  })
  .catch((error) => {
    res.status(500).json({ error: 'Failed to retrieve reviews.' });
  });
});

app.post('/api/reviews', (req, res) => {
  const reviewData = req.body;

  if (!isValidReview(reviewData)) {
    res.status(400).json({ error: 'Invalid review data.' });
    return;
  }

  const review = new Review(reviewData);

  review.save()
  .then(() => {
    res.status(201).json({ message: 'Review saved successfully!' });
  })
  .catch((error) => {
    res.status(500).json({ error: 'Failed to save review.' });
  });
});

function isValidReview(review) {
  if (
    !review.title || typeof review.title !== 'string' || !review.title.trim() ||
    !review.content || typeof review.content !== 'string' || !review.content.trim() ||
    !review.productId || typeof review.productId !== 'string' || !review.productId.trim() ||
    !review.rating || typeof review.rating !== 'number' || review.rating < 1 || review.rating > 5
  ) {
    return false;
  }

  return true;
}


























