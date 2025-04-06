const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the add replies action correctly', async () => {
    // Arrange
    const useCasePayload = {
      id: 'reply-1',
      thread: 'thread-1',
      comment: 'comment-1',
      owner: 'user-1',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyAvailableComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyAvailableReply = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyOwnerReply = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReply = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const getReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const deletedComment = await getReplyUseCase.execute(useCasePayload);

    // Assert
    expect(deletedComment).toStrictEqual({
      status: 'success',
    });
    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCasePayload.thread);
    expect(mockCommentRepository.verifyAvailableComment).toBeCalledWith(useCasePayload.comment, useCasePayload.thread);
    expect(mockReplyRepository.verifyAvailableReply).toBeCalledWith(useCasePayload.id);
    expect(mockReplyRepository.verifyOwnerReply).toBeCalledWith(useCasePayload.id, useCasePayload.thread, useCasePayload.comment, useCasePayload.owner);
    expect(mockReplyRepository.deleteReply).toBeCalledWith(useCasePayload.id);
  });
});
