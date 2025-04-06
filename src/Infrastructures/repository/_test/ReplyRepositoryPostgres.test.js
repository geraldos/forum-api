const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const RepliesTableTestHelper = require("../../../../tests/RepliesTableHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableHelper");
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe('ReplyRepositoryPostgres', () => {
  beforeEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist add reply', async () => {
      // Arrange
      const addReply = new AddReply({
        content: 'komentar ini bagus',
      });
      const owner = 'user-1';
      const fakeIdGenerator = () => '1';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepositoryPostgres.addReply(addReply, owner, 'thread-1', 'comment-1');

      // Assert
      const reply = await RepliesTableTestHelper.findReplyById('reply-1');
      expect(reply).toHaveLength(1);
    });

    it('should return added reply correctly', async () => {
      // Arrange
      const addReply = new AddReply({
        content: 'komentar ini bagus',
      });
      const owner = 'user-1';
      const fakeIdGenerator = () => '1'; // stub!
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(addReply, owner);

      // Assert
      expect(addedReply).toStrictEqual(new AddedReply({
        id: 'reply-1',
        content: 'komentar ini bagus',
        owner: 'user-1',
      }));
    });
  });

  describe('getReplyByThreadIdCommentId function', () => {
    it('should return reply correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-1' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        thread: 'thread-1',
        owner: 'user-1',
        content: 'thread ini bagus',
      });
      await RepliesTableTestHelper.addReplies({
        id: 'reply-1',
        threadId: 'thread-1',
        commentId: 'comment-1',
        owner: 'user-1',
        content: 'komentar ini bagus',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getReplyByThreadIdCommentId('comment-1', 'thread-1');

      // Assert
      expect(replies[0].id).toEqual('reply-1');
      expect(replies[0].content).toEqual('komentar ini bagus');
      expect(replies[0].username).toEqual('dicoding');
      expect(replies[0]).toHaveProperty('date');
      expect(replies[0]).toHaveProperty('id');
      expect(replies[0]).toHaveProperty('username');
      expect(replies[0]).toHaveProperty('content');
    });
  });

  describe('deleteReply function', () => {
    it('should persist deleted reply', async () => {
      // Arrange
      const replyId = 'reply-1';
      const fakeIdGenerator = () => '1';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepositoryPostgres.deleteReply(replyId);

      // Assert
      const replies = await RepliesTableTestHelper.findReplyById('reply-1');
      expect(replies).toHaveLength(0);
    });
  });

  describe('verifyAvailableReply function', () => {
    it('should not throw error when reply is available', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-1' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-1' });
      await CommentsTableTestHelper.addComment({ id: 'comment-1', thread: 'thread-1', owner: 'user-1' });
      await RepliesTableTestHelper.addReplies({id: 'reply-1', threadId: 'thread-1', commentId: 'comment-1', owner: 'user-1' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyAvailableReply('reply-1')).resolves.not.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when reply is not available', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyAvailableReply('reply-1')).rejects.toThrowError(NotFoundError);
    });
  });

  describe('verifyOwnerReply function', () => {
    it('should not throw error when reply is yours', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-1' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-1' });
      await CommentsTableTestHelper.addComment({ id: 'comment-1', thread: 'thread-1', owner: 'user-1' });
      await RepliesTableTestHelper.addReplies({id: 'reply-1', threadId: 'thread-1', commentId: 'comment-1', owner: 'user-1' });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyOwnerReply('reply-1', 'thread-1', 'comment-1', 'user-1')).resolves.not.toThrowError(AuthorizationError);
    });

    it('should throw AuthorizationError when reply is not yours', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-2', username: 'dicoding-2' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-1' });
      await CommentsTableTestHelper.addComment({ id: 'comment-1', thread: 'thread-1', owner: 'user-1' });
      await RepliesTableTestHelper.addReplies({
        id: 'reply-1',
        threadId: 'thread-1',
        commentId: 'comment-1',
        owner: 'user-2'
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyOwnerReply('reply-1', 'thread-1', 'comment-1', 'user-1'))
        .rejects
        .toThrowError(AuthorizationError);
    });
  });
});
