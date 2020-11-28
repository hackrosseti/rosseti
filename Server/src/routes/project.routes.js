const {Router} = require('express');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');
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

// /api/project/getSortedClassificators
router.get(
   '/getSortedClassificators',
   wrapAccess(auth, access.project.getSortedClassificators),
   (request, response) =>
     request.pool
        .query(db.queries.project.getSortedClassificators())
        .then(db.getAll)
        .then((result) => response.json({ classificators: [
           {
               project_class: 1,
               class_name: "Все"
           },
           ...result
         ]}))
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
            SUM(l.weight)::int as likes_weight,
            DATE(MIN(ph.change_date)) as date_create,
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
         project_name, project_describe, project_status, project_class, author, conference_link,
         region_id, project_offer, project_profit, date_end, image
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
                  project_name, project_describe, project_status, project_class, author, conference_link,
                  region_id, project_offer, project_profit, date_end, image
               })))
               .then(db.getOne)
               .then((res) => {
                  project = res;
               })

               .then(() => client.query(db.queries.project.setDocuments({ project_id: project.project_id })))

               .then(() => client.query(db.queries.insert('project_history', {
                  project_id: project.project_id,
                  changemaker: request.user.userId
               })))
               .then(db.getOne)
               .then(res => {
                  if (!res) {
                     response.status(400).json({ message: 'Не удалось назначить статус проекту' });
                     throw 'internal';
                  }
               })
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
   wrapResponse((request, response) => {
      var project = null;
      const {
         project_id, project_name, project_describe, project_status, project_class, author,
         conference_link, region_id, project_offer, project_profit, date_end, image
      } = request.body;

      if (!project_id) {
         return response.status(400).json({ message: 'Не задан ID проекта для модификации' });
      }

      request.pool.connect()
         .then(client => {
            return client
               .query(db.queries.update('project', {
                  project_name, project_describe, project_status, project_class, author, conference_link,
                  region_id, project_offer, project_profit, date_end, image
               }, { project_id: project_id }))
               .then(db.getOne)
               .then(res => {
                  console.log(res);
                  if (res) {
                     project = res;
                     return client.query(db.queries.project.setDocuments({ project_id: res.project_id }))
                  } else {
                     handleDefault(new Error('Не удалось изменить данные по проекту'), response);
                  }
               })
               .then(() => client.release())
               .then(() => response.json({ projectId: project.project_id }))
               .catch(e => {
                  client.release();
                  handleDefault(e, response);
               })
         });
   })
);

/******************************************* ПРОЕКТЫ: ПОЛУЧЕНИЕ ПО ПОЛЯМ ***********************************/

// /api/project/getProjectByProjectId
router.get(
   '/getProjectByProjectId',
   wrapAccess(auth, access.project.getProjectByProjectId),
   wrapResponse((request, response) => {
      var project = null;
      var comments = null;
      var likes = null;
      const { projectId } = request.query;

      request.pool.connect()
         .then(client => {
            return client
               .query(db.queries.select('project', { project_id: projectId },
               `
                  pc.class_name,
                  u.firstname, u.surname, u.lastname, u.company, u.position, u.department,
                  u.profile_image as author_image,
                  (SELECT r.region_name FROM regions as r WHERE r.region_id = u.region_id) as author_region,
                  (SELECT SUM(l.weight) FROM likes as l WHERE l.project_id = :project_id)::int as totalweight,
                  (SELECT COUNT(*) FROM project_comments as c WHERE c.project = :project_id)::int as comments
               `, 
               `
                  LEFT JOIN project_classificator as pc ON pc.class_id = t.project_class
                  LEFT JOIN users as u ON u.user_id = t.author
               `,
               `
                  GROUP BY t.project_id, pc.class_name, u.firstname, u.surname, u.profile_image,
                           u.company, u.position, u.department, u.lastname, u.region_id
               `)).then(db.getOne).then(res => { project = res; })
               .then(() => 
                  client.query(db.queries.select('project_comments', { project: projectId },
                  `
                     u.surname, u.firstname, u.lastname, u.profile_image
                  `,
                  `
                     LEFT JOIN users as u ON u.user_id = t.user_id
                  `
                  )).then(db.getAll).then(res => { comments = res; })
               )
               .then(() =>
                  client.query(db.queries.select('likes', { project_id: projectId },
                  `
                     u.surname, u.firstname, u.profile_image as like_author_profile_image,
                     ll.expert_link, ll.likelink_id
                  `,
                  `
                     LEFT JOIN users as u ON u.user_id = t.user_id
                     LEFT JOIN expert_like_link ll ON ll.like_id = t.like_id
                  `))
                  .then(db.getAll)
                  .then(res => { likes = res; })
               )
               .then(() => client.release())
               .then(() => response.json({
                  project: project,
                  likes: {
                     data: likes, 
                     totalweight: project.totalweight
                  },
                  comments: comments

               }))
               .catch(e => {
                  client.release();
                  handleDefault(e, response);
               })
         });
   })
);

// /api/project/getProjectsByClassificator
router.get(
   '/getProjectsByClassificator',
   wrapAccess(auth, access.project.getProjectsByClassificator),
   (request, response) =>
      request.pool
         .query(db.queries.select('project', { classId: request.query.classificatorId },
         `
            (SELECT SUM(l.weight)::int FROM likes as l WHERE l.project_id = t.project_id) as likes_weight,
            (SELECT DATE(MIN(ph.change_date)) FROM project_history as ph WHERE ph.project_id = t.project_id) as date_create,
            u.profile_image as author_image,
            u.firstname as author_firstname,
            u.surname as author_surname,
            pc.class_name as classificator
         `,
         `
            LEFT JOIN users as u ON u.user_id = t.author
            LEFT JOIN project_classificator as pc ON pc.class_id = t.project_class
         `,
         `
            WHERE t.project_class in (SELECT * FROM g1(:classId))
            GROUP BY t.project_id, u.profile_image, u.firstname, u.surname, pc.class_name
            ORDER BY date_create DESC
         `, false))
         .then(db.getAll)
         .then((result) => response.json({ projects: result }))
         .catch((e) => handleDefault(e, response))
);
 
// /api/project/getByField
router.get(
   '/getByField',
   wrapAccess(auth, access.project.getByField),
   (request, response) =>
      request.pool
         .query(db.queries.select('project', { [Object.keys(request.query)[0]]: Object.values(request.query)[0] }))
         .then(db.getAll)
         .then(res => response.json({ projects: res }))
         .catch((e) => handleDefault(e, response))
)

//*******************************   *************************************/

// /api/project/updateProjectStatus
router.get(
   '/updateProjectStatus',
   wrapAccess(auth, access.project.updateProjectStatus),
   wrapResponse((request, response) => {
      var previousStatus = null;
      var project = null;
      const { projectId, projectStatusId } = request.query;

      request.pool.connect()
         .then(client => {
            return client
               .query(db.queries.select('project', { project_id: projectId }))
               .then(db.getOne)
               .then(res => { previousStatus = res.project_status; })

               .then(() => client.query(db.queries.update('project', {
                  project_status: projectStatusId
               }, { project_id: projectId })))
               .then(db.getOne)
               .then(res => {
                  if (!res) {
                     response.status(400).json({ message: 'Не удалось сменить статус проекта' });
                     throw 'internal';
                  } else {
                     project = res;
                  }
               })

               .then(() => client.query(db.queries.insert('project_history', {
                  project_id: projectId,
                  changemaker: request.user.userId,
                  previous_status: previousStatus
               })))
               .then(() => client.release())
               .then(() => response.json({ projectId: project.project_id }))
               .catch(e => {
                  client.release();
                  handleDefault(e, response);
               })
         });
   })
);
 
// /api/project/generateReportByProjectId
router.get(
   '/generateReportByProjectId',
   wrapAccess(auth, access.project.generateReportByProjectId),
   wrapResponse((request, response) => {
      const { projectId } = request.query;
      const template = '../../template/template.docx';

      request.pool
         .query(db.queries.select('project', { project_id: projectId })).then(db.getOne)
         .then(project => {
				const content = fs.readFileSync(path.resolve(__dirname, template), 'binary');
				const zip = new PizZip(content);
				const doc = new Docxtemplater(zip);

				doc.setData({
					project_name: project.project_name,
					project_describe: project.project_describe
				});
				
            doc.render();
            
            return doc.getZip().generate({ type: 'nodebuffer' });
         })
         .then((result) => response.json({ result }))
         .catch((e) => handleDefault(e, response))
   })
);
 

module.exports = router;