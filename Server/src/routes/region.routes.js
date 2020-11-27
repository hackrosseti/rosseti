const {Router} = require('express');
import {db, wrapResponse, wrapAccess, handleDefault} from '../utils';
import auth from '../middleware/auth.middleware';
import access from './../access';
const router = Router();

// /api/region/getAll
router.get(
    '/getAll',
    wrapAccess(auth, access.region.getAll),
    wrapResponse(async (request, response) => {
       const regions = await request.client.query(
          db.queries.select('regions')
       ).then(db.getAll).catch((e) => handleDefault(response, e));
 
       response.json({ regions });
    })
);

module.exports = router;