const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist add thread', async () => {
      // Arrange
      const addThread = new AddThread({
        title: 'alpha',
        body: 'body',
      });
      const owner = 'user-1';
      const fakeIdGenerator = () => '1';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await threadRepositoryPostgres.addThread(addThread, owner);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-1');
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      // Arrange
      const addThread = new AddThread({
        title: 'alpha',
        body: 'body',
      });
      const owner = 'user-1';
      const fakeIdGenerator = () => '1'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(addThread, owner);

      // Assert
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-1',
        title: 'alpha',
        owner: 'user-1',
      }));
    });
  });

  describe('verifyAvailableThread function', () => {
    it('should not throw error when thread is available', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'dicoding-2' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-1' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyAvailableThread('thread-1')).resolves.not.toThrowError(NotFoundError);
    });

    it('should throw NotFoundError when thread is not available', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(threadRepositoryPostgres.verifyAvailableThread('thread-1')).rejects.toThrowError(NotFoundError);
    });
  });

  describe('getDetailThread function', () => {
    it('should return thread correctly', async () => {
      // Arrange: insert user dulu
      await UsersTableTestHelper.addUser({
        id: 'user-1',
        username: 'dicoding',
      });

      // Baru insert thread yang owner-nya user-1
      await ThreadsTableTestHelper.addThread({
        id: 'thread-1',
        title: 'alpha',
        body: 'body',
        owner: 'user-1',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Act
      const getDetailThread = await threadRepositoryPostgres.getDetailThread('thread-1');

      // Assert
      expect(getDetailThread.id).toEqual('thread-1');
      expect(getDetailThread.title).toEqual('alpha');
      expect(getDetailThread.body).toEqual('body');
      expect(getDetailThread.username).toEqual('dicoding');
      expect(getDetailThread).toHaveProperty('date');
      expect(getDetailThread.comments).toEqual([]);
    });
  });
});
