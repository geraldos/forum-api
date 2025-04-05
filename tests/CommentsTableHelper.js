/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool')

const CommentsTableTestHelper = {
  async addComment ({
                      id = 'comment-1', threadId = 'thread-1', owner = 'user-1', content = 'thread ini bagus', date = '2024-04-04', is_delete = false
                    }) {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, threadId, owner, content, date, is_delete],
    }

    await pool.query(query);
  },

  async findCommentsById (id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const { rows } = await pool.query(query);
    return rows;
  },

  async cleanTable () {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
}

module.exports = CommentsTableTestHelper
