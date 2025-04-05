const CommentsTableTestHelper = require('../../../../tests/CommentsTableHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment', async () => {
      // Arrange
      const addComment = new AddComment({
        content: 'thread ini bagus',
      });
      const owner = 'user-1';
      const fakeIdGenerator = () => '1';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(addComment, owner);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById('comment-1');
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        content: 'thread ini bagus',
      });
      const owner = 'user-1';
      const fakeIdGenerator = () => '1'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(addComment, owner);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-1',
        content: 'thread ini bagus',
        owner: 'user-1',
      }));
    });
  });

  describe('deleteComment function', () => {
    it('should persist deleted comment', async () => {
      // Arrange
      const commentId = 'comment-1';
      const fakeIdGenerator = () => '1';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.deleteComment(commentId);

      // Assert
      const comments = await CommentsTableTestHelper.findCommentsById('comment-1');
      expect(comments).toHaveLength(0);
    });
  });

  describe('verifyAvailableComment function', () => {
    it('should not throw error when comment is available', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-1' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-1' });
      await CommentsTableTestHelper.addComment({ id: 'comment-1', thread: 'thread-1', owner: 'user-1' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyAvailableComment('comment-1')).resolves.not.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when comment is not available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyAvailableComment('comment-1')).rejects.toThrowError(NotFoundError);
    });
  });

  describe('verifyOwnerComment function', () => {
    it('should not throw error when comment is yours', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-1' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-1' });
      await CommentsTableTestHelper.addComment({ id: 'comment-1', thread: 'thread-1', owner: 'user-1' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyOwnerComment('comment-1', 'user-1')).resolves.not.toThrowError(AuthorizationError);
    });

    it('should not throw error AuthorizationError when comment is not yours', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-1' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-1' });
      await CommentsTableTestHelper.addComment({ id: 'comment-1', thread: 'thread-1', owner: 'user-1' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyOwnerComment('comment-1', 'user-12')).rejects.toThrowError(AuthorizationError);
    });
  });

  describe('getCommentByThreadId function', () => {
    it('should return comment correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-1' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        thread: 'thread-1',
        owner: 'user-1',
        content: 'thread ini bagus',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const getCommentByThreadId = await commentRepositoryPostgres.getCommentByThreadId('thread-1');

      // Assert
      expect(getCommentByThreadId[0].id).toEqual('comment-1');
      expect(getCommentByThreadId[0].content).toEqual('thread ini bagus');
      expect(getCommentByThreadId[0].username).toEqual('dicoding');
      expect(getCommentByThreadId[0]).toHaveProperty('date');
      expect(getCommentByThreadId[0]).toHaveProperty('id');
      expect(getCommentByThreadId[0]).toHaveProperty('username');
      expect(getCommentByThreadId[0]).toHaveProperty('date');
      expect(getCommentByThreadId[0]).toHaveProperty('content');
    });
  });
});
