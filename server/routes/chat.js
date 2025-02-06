const express = require('express');
const GroupMessage = require('../models/GroupMessage');

const router = express.Router();

router.get('/:room', async (req, res) => {
  try {
    const messages = await GroupMessage.find({ room: req.params.room });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;