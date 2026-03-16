import express from 'express';
import { getSubjects, getSubject, createSubject, updateSubject, deleteSubject } from '../controllers/subjectController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSubjects)
  .post(createSubject);

router.route('/:id')
  .get(getSubject)
  .put(updateSubject)
  .delete(deleteSubject);

export default router;
