const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError')
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError')

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(addComment, owner, threadId) {
    const { content } = addComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date();

    const query = {
      text: 'INSERT INTO comments(id, thread_id, content, owner, date) VALUES($1, $2, $3, $4, $5) RETURNING id, thread_id, content, owner, date',
      values: [id, threadId, content, owner, date],
    };

    const result = await this._pool.query(query);
    return new AddedComment({ ...result.rows[0] });
  }

  async deleteComment (commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete=TRUE WHERE id=$1',
      values: [commentId]
    };
    await this._pool.query(query);
  }

  async verifyAvailableComment (commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id=$1 AND is_delete=FALSE',
      values: [commentId]
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Comment not found');
    };
  }

  async verifyOwnerComment (commentId, owner) {
    const query = {
      text: 'SELECT * FROM comments WHERE id=$1 AND owner=$2',
      values: [commentId, owner]
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new AuthorizationError('This comment is not yours')
    };
  }

  async getCommentByThreadId (commentId) {
    const query = {
      text: `SELECT
                 comments.id,
                 users.username,
                 comments.date,
                 comments.content,
                 comments.is_delete
             FROM comments
                      JOIN users ON users.id = comments.owner
             WHERE comments.thread_id = $1
             ORDER BY comments.date ASC;`,
      values: [commentId]
    }
    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = CommentRepositoryPostgres;
