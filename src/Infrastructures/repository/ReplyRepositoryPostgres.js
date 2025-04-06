const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError')
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError')

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(addReply, owner, threadId, commentId) {
    const { content } = addReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date();

    const query = {
      text: 'INSERT INTO replies(id, comment_id, thread_id, content, owner, date) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, thread_id, content, owner, date',
      values: [id, commentId, threadId, content, owner, date],
    };

    const result = await this._pool.query(query);
    return new AddedReply({ ...result.rows[0] });
  }

  async getReplyByThreadIdCommentId (commentId, threadId) {
    const query = {
      text: `
          SELECT
              replies.id,
              users.username,
              replies.date,
              replies.content,
              replies.is_delete
          FROM replies
                   JOIN users ON users.id = replies.owner
                   JOIN comments ON comments.id = replies.comment_id
          WHERE replies.comment_id = $1
            AND comments.thread_id = $2
          ORDER BY replies.date ASC;
      `,
      values: [commentId, threadId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async deleteReply (replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete=TRUE WHERE id=$1',
      values: [replyId]
    };
    await this._pool.query(query);
  }

  async verifyAvailableReply (replyId) {
    const query = {
      text: 'SELECT id FROM replies WHERE id=$1 AND is_delete=FALSE',
      values: [replyId]
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Reply not found');
    };
  }

  async verifyOwnerReply (replyId, threadId, commentId, owner) {
    const query = {
      text: 'SELECT * FROM replies WHERE id=$1 AND thread_id=$2 AND comment_id=$3 AND owner=$4',
      values: [replyId, threadId, commentId, owner]
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('This reply is not yours');
    };
  }
}

module.exports = ReplyRepositoryPostgres;
