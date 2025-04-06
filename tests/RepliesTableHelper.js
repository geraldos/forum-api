/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool')

const RepliesTableTestHelper = {
  async addReplies ({
                      id = 'reply-1',
                      threadId = 'thread-1',
                      commentId = 'comment-1',
                      owner = 'user-1',
                      content = 'komentar ini bagus',
                      date = '2023-02-15',
                      is_delete = false
                    }) {
    const query = {
      text: 'INSERT INTO replies(id, thread_id, comment_id, owner, content, date) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, thread_id, owner, content, date',
      values: [id, threadId, commentId, owner, content, date],
    };

    await pool.query(query);
  },

  async findReplyById (id) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id]
    };

    const { rows } = await pool.query(query);
    return rows;
  },

  async cleanTable () {
    await pool.query('DELETE FROM replies WHERE 1=1');
  }
}

module.exports = RepliesTableTestHelper
