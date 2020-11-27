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
 
       response.json({ classificators });
    })
);

/********************************* ПРОЕКТЫ *****************************************/

// /api/project/getAllProjects
router.get(
   '/getAllProjects',
   wrapAccess(auth, access.project.getAllProjects),
   wrapResponse(async (request, response) => {
      const projects = await request.client.query(
         db.queries.select('project')
      ).then(db.getAll).catch((e) => handleDefault(response, e));

      response.json({ projects });
   })
);

// /api/project/addProject
router.post(
   '/addProject',
   wrapAccess(auth, access.project.addProject),
   wrapResponse(async (request, response) => {
      const {
         project_name, project_describe, project_status, project_class, author, conference_link, region_id, project_offer, project_profit
      } = request.body;

      const candidate = await request.client.query(
         db.queries.select('project', { project_name })
      ).then(db.getOne).catch((e) => handleDefault(e, response));

      if (candidate) {
         return response.status(400).json({ message: "Проект с таким названием уже существует" });
      }

      let projectRes = {};
      await request.client.query(db.queries.insert('project', {
         project_name, project_describe, project_status, project_class, author, conference_link, region_id, project_offer, project_profit
      }))
      .then(db.getOne)
      .then(async (project) => {
         console.log(project);
         if (project) {
            projectRes = project;
            await request.client.query(db.queries.project.setDocuments({ project_id: project.project_id }))
               .catch(e => handleDefault(e, response));
         } else {
            handleDefault(new Error('Внутрення ошибка'), response);
         }
      })
      .catch((e) => handleDefault(e, response));

      response.status(201).json({ message: "Проект создан", projectId: projectRes['project_id'] });
   })
);

module.exports = router;