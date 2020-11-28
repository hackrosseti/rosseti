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


// /api/dashboard/getClassificators
router.get(
    '/getClassificators',
    wrapAccess(auth, access.dashboard.getClassificators),
    (request, response) =>
      request.pool
         .query(db.queries.dashboard.getClassificators(request.query.classificatorId))
         .then(db.getAll)
         .then((result) => response.json({ classificators: result.map(res => res.g1) }))
         .catch((e) => handleDefault(e, response))
);

module.exports = router;