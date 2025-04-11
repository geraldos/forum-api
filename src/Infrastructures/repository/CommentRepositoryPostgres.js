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
      text: 'INSERT INTO comments(id, thread_id, content, owner, date, is_delete, like_count , liked_by) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, thread_id, content, owner, date, is_delete, like_count AS "likeCount"',
      values: [id, threadId, content, owner, date, false, 0, '{}'],
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

  async verifyAvailableComment(commentId, threadId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND thread_id = $2 AND is_delete = false',
      values: [commentId, threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }
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
                 comments.is_delete,
                 comments.like_count AS "likeCount"
             FROM comments
                      JOIN users ON users.id = comments.owner
             WHERE comments.thread_id = $1
             ORDER BY comments.date ASC;`,
      values: [commentId]
    }
    const result = await this._pool.query(query);
    return result.rows;
  }

  async likeComment (commentId, userId) {
    const query = {
      text: `
          UPDATE comments
          SET
              liked_by =
                  CASE
                      WHEN $2 = ANY(liked_by) THEN array_remove(liked_by, $2)
                      ELSE array_append(liked_by, $2)
                      END,
              like_count =
                  CASE
                      WHEN $2 = ANY(liked_by) THEN like_count - 1
                      ELSE like_count + 1
                      END
          WHERE id = $1
              RETURNING like_count, liked_by
    `,
      values: [commentId, userId],
    };
    const result = await this._pool.query(query);
    return result.rows[0];
  }
}

module.exports = CommentRepositoryPostgres;
