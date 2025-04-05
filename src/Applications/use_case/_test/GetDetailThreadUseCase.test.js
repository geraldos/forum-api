const Thread = require('../../../Domains/threads/entities/Thread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');

describe('GetDetailThreadUseCase', () => {
  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      id : 'thread-1',
    };
    const mockComment = [
      {
        id: 'comment-1',
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'sebuah comment',
        is_delete: false,
      },
      {
        id: 'comment-2',
        username: 'dicoding',
        date: '2021-08-08T07:26:21.338Z',
        content: '**komentar telah dihapus**',
        is_delete: true,
      }
    ];
    const mockThread = new Thread({
      id: 'thread-1',
      title: 'alpha',
      body: 'body',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: mockComment,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.getDetailThread = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComment));

    /** creating use case instance */
    const getThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const detailThread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(detailThread).toStrictEqual(mockThread);
    expect(mockThreadRepository.getDetailThread).toBeCalledWith(useCasePayload.id);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(useCasePayload.id);
    expect(detailThread.comments[0].content).toBe('sebuah comment');
    expect(detailThread.comments[1].content).toBe('**komentar telah dihapus**');
  });

  it('should return thread detail with empty comments array when there are no comments', async () => {
    // Arrange
    const useCasePayload = { id: 'thread-456' };

    const mockDetailThread = {
      id: 'thread-456',
      title: 'Thread Without Comments',
      body: 'No one commented yet.',
      date: '2022-01-10',
      username: 'user1',
      comments: [],
    };

    const expectedResult = {
      ...mockDetailThread,
      comments: [],
    };

    // Mock dependencies
    const mockThreadRepository = {
      getDetailThread: jest.fn()
        .mockImplementationOnce(() => Promise.resolve(mockDetailThread))
        .mockImplementationOnce(() => Promise.resolve(expectedResult)),
    };

    const mockCommentRepository = {
      getCommentByThreadId: jest.fn(() => Promise.resolve([])),
    };

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Act
    const result = await getDetailThreadUseCase.execute(useCasePayload);

    // Assert
    expect(mockCommentRepository.getCommentByThreadId).toHaveBeenCalledWith('thread-456');
    expect(result.comments).toEqual([]);
    expect(result).toEqual(expectedResult);
  });
});
