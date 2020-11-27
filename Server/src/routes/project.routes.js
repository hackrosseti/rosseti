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
         .query(db.queries.select('project', {},
         `
            COUNT(l.like_id)::int as likes_сount,
            MIN(ph.change_date) as date_create,
            u.profile_image as author_image,
            u.firstname as author_firstname,
            u.surname as author_surname,
            (SELECT pc.class_name FROM project_classificator as pc WHERE pc.class_id = t.project_class) as classificator
         `,
         `
            LEFT JOIN likes as l ON l.project_id = t.project_id
            LEFT JOIN project_history as ph ON ph.project_id = t.project_id
            LEFT JOIN users as u ON u.user_id = t.author
         `,
         `
            GROUP BY t.project_id, u.profile_image, u.firstname, u.surname
            ORDER BY date_create DESC
         `))
         .then(db.getAll)
         .then((result) => response.json({ projects: result }))
         .catch((e) => handleDefault(e, response))
);

// /api/project/addProject
router.post(
   '/addProject',
   wrapAccess(auth, access.project.addProject),
   wrapResponse((request, response) => {
      var project = null;
      const {
         project_name, project_describe, project_status, project_class, author, conference_link, region_id, project_offer, project_profit
      } = request.body;

      const checkProjectDoesNotExist = (project) => {
         if (project) {
            response.status(400).json({ message: "Проект с таким названием уже существует" });
            throw 'internal';
         }
      };

      request.pool.connect()
         .then(client => {
            return client
               .query(db.queries.select('project', { project_name }))
               .then(db.getOne)
               .then(checkProjectDoesNotExist)

               .then(() => client.query(db.queries.insert('project', {
                  project_name, project_describe, project_status, project_class, author, conference_link, region_id, project_offer, project_profit
               })))
               .then(db.getOne)
               .then((res) => {
                  project = res;
               })

               .then(() => client.query(db.queries.project.setDocuments({ project_id: project.project_id })))
               .then(() => client.release())
               .then(() => response.status(201).json({ message: "Проект создан", projectId: project.project_id }))
               .catch(e => {
                  client.release();
                  handleDefault(e, response);
               })
         });
   })
);

// /api/project/updateProject
router.post(
   '/updateProject',
   wrapAccess(auth, access.project.updateProject),
   wrapResponse(async (request, response) => {
      const {
         project_id, project_name, project_describe, project_status, project_class, author, conference_link, region_id, project_offer, project_profit, date_end
      } = request.body;

      if (!project_id) {
         return response.status(400).json({ message: 'Не задан ID проекта для модификации' });
      }

      request.pool
         .query(db.queries.update('project', {
            project_name, project_describe, project_status, project_class, author, conference_link, region_id, project_offer, project_profit
         }, { project_id: project_id }))
         .then(db.getOne)
         .then(project => {
            if (project) {
               response.json({ projectId: project.project_id });
            } else {
               handleDefault(new Error('Не удалось изменить данные по проекту'), response);
            }
         })
         .catch((e) => handleDefault(e, response))
   })
);

// /api/project/getProjectByProjectId
router.get(
   '/getProjectByProjectId',
   wrapAccess(auth, access.project.getProjectByProjectId),
   (request, response) => {
      const { projectId } = request.query;
      request.pool
         .query(db.queries.select('project', { project_id: projectId }))
         .then(db.getOne)
         .then((result) => response.json({ project: result }))
         .catch((e) => handleDefault(e, response));
   }
);

module.exports = router;