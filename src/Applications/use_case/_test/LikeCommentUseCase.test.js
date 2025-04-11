const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const LikeCommentUseCase = require('../LikeCommentUseCase');

describe('LikeCommentUseCase', () => {
  it('should orchestrating the like comments action correctly', async () => {
    // Arrange
    const useCasePayload = {
      comment: 'comment-1',
      thread: 'thread-1',
      owner: 'user-1',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyAvailableComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.likeComment = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const getCommentUseCase = new LikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const likeComment = await getCommentUseCase.execute(useCasePayload);

    // Assert
    expect(likeComment).toStrictEqual({
      status: 'success',
    });
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCasePayload.thread);
    expect(mockCommentRepository.verifyAvailableComment).toBeCalledWith(useCasePayload.comment, useCasePayload.thread);
    expect(mockCommentRepository.likeComment).toBeCalledWith(useCasePayload.comment, useCasePayload.owner);
  });
});
