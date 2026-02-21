const express = require('express');
const router = express.Router();

const notesRouter = require('./notes');
const categoriesRouter = require('./categories');
const tagsRouter = require('./tags');
const trashRouter = require('./trash');

router.use('/notes', notesRouter);
router.use('/categories', categoriesRouter);
router.use('/tags', tagsRouter);
router.use('/trash', trashRouter);

module.exports = router;
