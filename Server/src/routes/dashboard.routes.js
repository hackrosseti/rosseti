const {Router} = require('express');
import {db, wrapResponse, wrapAccess, handleDefault} from '../utils';
import auth from '../middleware/auth.middleware';
import access from './../access';
const router = Router();

// /api/dashboard/getProjects
router.get(
    '/getProjects',
    wrapAccess(auth, access.dashboard.getProjects),
    (request, response) =>
      request.pool
         .query(db.queries.dashboard.getProjects())
         .then(db.getAll)
         .then((statuses) => response.json({ projects: statuses }))
         .catch((e) => handleDefault(e, response))
);

module.exports = router;