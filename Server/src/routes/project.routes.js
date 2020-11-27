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
    (request, response) =>
      request.pool
         .query(db.queries.select('project_classificator'))
         .then(db.getAll)
         .then((result) => response.json({ classificators: result }))
         .catch((e) => handleDefault(e, response))
);

/********************************* ПРОЕКТЫ *****************************************/

// /api/project/getAllProjects
router.get(
   '/getAllProjects',
   wrapAccess(auth, access.project.getAllProjects),
   (request, response) =>
      request.pool
         .query(db.queries.select('project'))
         .then(db.getAll)
         .then((result) => response.json({ projects: result }))
         .catch((e) => handleDefault(e, response))
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
            handleDefault(new Error('Не удалось создать новый проект'), response);
         }
      })
      .catch((e) => handleDefault(e, response));

      response.status(201).json({ message: "Проект создан", projectId: projectRes['project_id'] });
   })
);

// /api/project/updateProject
router.post(
   '/updateProject',
   // wrapAccess(auth, access.project.updateProject),
   wrapResponse(async (request, response) => {
      const {
         project_id, project_name, project_describe, project_status, project_class, author, conference_link, region_id, project_offer, project_profit, date_end
      } = request.body;

      if (author) {
         return response.status(400).json({ message: 'Нельзя изменить автора проекта' });
      }

      if (!project_id) {
         return response.status(400).json({ message: 'Не задан ID проекта для модификации' });
      }

      request.client.query(db.queries.update('project', {
         project_name, project_describe, project_status, project_class, author, conference_link, region_id, project_offer, project_profit
      }, { project_id }))
         .then(db.getOne)
         .then(project => {
            if (project) {
               response.json({ projectId: project.project_id });
            } else {
               handleDefault(new Error('Не удалось изменить данные по проекту'), response);
            }
         })
         .catch(e => handleDefault(e, response));
   })
);

module.exports = router;