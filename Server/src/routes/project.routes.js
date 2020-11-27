const {Router} = require('express');
import {db, wrapResponse, wrapAccess, handleDefault} from '../utils';
import auth from '../middleware/auth.middleware';
import access from './../access';
const router = Router();

/********************************** КЛАССИФИКАТОР *************************************/

// /api/project/getAllProjectClassificators
router.get(
    '/getAllProjectClassificators',
    wrapAccess(auth, access.project.getAllProjectClassificators),
    wrapResponse(async (request, response) => {
       const classificators = await request.client.query(
          db.queries.select('project_classificator')
       ).then(db.getAll).catch((e) => handleDefault(response, e));
 
       response.json({ classificators: classificators });
    })
);

/********************************* ПРОЕКТЫ *****************************************/

// /api/project/getAllProjects
router.get(
   '/getAllProjects',
   // wrapAccess(auth, access.project.getAllProjects),
   wrapResponse(async (request, response) => {
      const projects = await request.client.query(
         db.queries.select('project')
      ).then(db.getAll).catch((e) => handleDefault(response, e));

      response.json({ projects: projects });
   })
);

module.exports = router;