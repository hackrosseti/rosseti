const sql = require('yesql').pg;
var config = require('config');

export const getFromConfig = (query) => {
   if (config.has(query)) {
       return config.get(query);
   }

   throw new Error(`Error getting "${query}" from config`);
}

// WRAPPERS
export const wrapSql = (queryString, data) => sql(queryString)(data);
export const handleDefault = (error, response) => {
   if (error !== 'internal') {
      console.log(error);
      if (response) {
         response.status(500).json({ message: `Ошибка на сервере '${error.message}'`, error, stack: error.stack });
      }
   }
};
export const wrapResponse = (func) => {
   return (request, response, next) => {
      try {
         func(request, response, next);
      } catch (error) {
         return handleDefault(error, response);
      }
   }
};
export const wrapAccess = (func, accessArray) => {
   return (request, response, next) => {
      func(request, response, next, accessArray);
   };
};
export const getWhere = (data, tableAlias) => 
   data && typeof data === 'object' && Object.keys(data).length
      ? `WHERE ${Object.keys(data).map((key) => `${tableAlias ? `${tableAlias}.` : ''}${key} = :${key}`).join(' AND ')}`
      : '';

// DB HELPERS
export const db = {
   getOne: (result) => result.rows?.[0],
   getAll: (result) => result.rows,
   queries: {
      // SELECT
      select: (table, data, additionalSelect, joins, endQuery, needWhere) => {
         const queryString = `SELECT t.* ${additionalSelect ? ', ' : ''}${additionalSelect || ''}
                              FROM ${table} as t ${joins || ''} ${needWhere === false ? '' : getWhere(data, 't')} ${endQuery || ''}`;
         // console.log(queryString);
         return wrapSql(queryString, data);
      },
      // INSERT
      insert: (table, data) => {
		 // console.log(table, data);
         const queryString = `INSERT INTO ${table} as t (${Object.keys(data).join(', ')}) VALUES (${
            Object.keys(data).map((key) => `:${key}`).join(', ')
         }) RETURNING *`;
         
         return wrapSql(queryString, data);
      },
      // UPDATE
      update: (table, data, whereData) => {
         const queryString = `UPDATE ${table} SET ${
            Object.keys(data).map((key) => `${key} = :${key}`).join(', ')
         } ${getWhere(whereData)} RETURNING *`;
         const wrapData = {...data, ...whereData};
         return wrapSql(queryString, wrapData);
      },
      // DELETE
      delete: (table, data) => {
         const queryString = `DELETE FROM ${table} ${getWhere(data, 't')}`;
         return wrapSql(queryString, data);
      },

      // API
      user: {
         getAllUsers: () => sql(`
            SELECT   user_id, login, role, password, firstname,
                     lastname, surname, company,
                     department, "position", r.region_name
            FROM users as u
            LEFT JOIN regions as r on r.region_id = u.region_id
         `)({}),
         
         setDocuments: (user_id) => sql(`
            UPDATE users as u
            SET document = to_tsvector(firstname || '. ' || lastname || '. ' || surname || '. ' || company || '. ' || department || '. ' || position) ${getWhere(user_id, 'u')}
         `)(user_id)
      },
      project: {
         setDocuments: (project_id) => sql(`
            UPDATE project as p
            SET document = to_tsvector(project_name || '. ' || project_describe) ${getWhere(project_id, 'p')}
         `)(project_id),

         getSortedClassificators: () => sql(`
            SELECT A.*, B.class_name
            FROM
               (SELECT  project_class,
                        COUNT(*) as countn
               FROM project
               GROUP BY project_class) as A
            INNER JOIN project_classificator as B ON B.class_id = A.project_class
            ORDER BY A.countn DESC
         `)({})
      },
      dashboard: {
         getProjects: () => sql(`
            SELECT 	B.project_id, B.project_status, B.project_class,
                     A.start_date as start_date,
                     A.last_date as last_date
            FROM project as B
            INNER JOIN
               (SELECT project_id, MIN(change_date) as start_date, MAX(change_date) as last_date
               FROM project_history
               GROUP BY project_id) as A
            ON A.project_id = B.project_id
            ORDER BY B.project_status
         `)({}),

         getClassificators: (id) => sql(`
            SELECT * FROM g1(:id)
         `)({ id: id })
      }
   }
};