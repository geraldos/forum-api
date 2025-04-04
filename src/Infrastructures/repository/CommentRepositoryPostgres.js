const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(addComment) {
    const { content } = addComment;
    const id = `comment-${this._idGenerator()}`;
    const owner = `user-${this._idGenerator()}`;
    const date = new Date();

    const query = {
      text: 'INSERT INTO comments(id, content, owner, date) VALUES($1, $2, $3, $4) RETURNING id, content, owner, date',
      values: [id, content, owner, date],
    };

    const result = await this._pool.query(query);
    return new AddedComment({ ...result.rows[0] });
  }
}

module.exports = CommentRepositoryPostgres;
