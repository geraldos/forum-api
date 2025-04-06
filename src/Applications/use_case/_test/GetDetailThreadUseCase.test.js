const Thread = require('../../../Domains/threads/entities/Thread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');

describe('GetDetailThreadUseCase', () => {
  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      id : 'thread-1',
    };
    const commentId1 = 'comment-1';
    const commentId2 = 'comment-2';
    const mockReply = [
      {
        id: 'reply-1',
        content: '**balasan telah dihapus**',
        date: '2021-08-08T07:59:48.766Z',
        username: 'johndoe',
        is_delete: true,
      },
      {
        id: 'reply-2',
        content: 'sebuah balasan',
        date: '2021-08-08T08:07:01.522Z',
        username: 'dicoding',
        is_delete: false,
      }
    ];
    const mockComment = [
      {
        id: commentId1,
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'sebuah comment',
        is_delete: false,
        replies: mockReply,
      },
      {
        id: commentId2,
        username: 'dicoding',
        date: '2021-08-08T07:26:21.338Z',
        content: '**komentar telah dihapus**',
        is_delete: true,
        replies: mockReply,
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
    const mockReplyRepository = new ReplyRepository();


    /** mocking needed function */
    mockThreadRepository.getDetailThread = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComment));
    mockReplyRepository.getReplyByThreadIdCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(mockReply));

    /** creating use case instance */
    const getThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const detailThread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(detailThread).toStrictEqual(mockThread);
    expect(mockThreadRepository.getDetailThread).toBeCalledWith(useCasePayload.id);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(useCasePayload.id);
    expect(mockReplyRepository.getReplyByThreadIdCommentId).toHaveBeenCalledWith(commentId1, 'thread-1');
    expect(mockReplyRepository.getReplyByThreadIdCommentId).toHaveBeenCalledWith(commentId2, 'thread-1');
    expect(detailThread.comments[0].content).toBe('sebuah comment');
    expect(detailThread.comments[1].content).toBe('**komentar telah dihapus**');
    expect(detailThread.comments[0].replies[0].content).toBe('**balasan telah dihapus**');
    expect(detailThread.comments[0].replies[1].content).toBe('sebuah balasan');
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
