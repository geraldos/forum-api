const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should orchestrating the add comments action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'komentar ini bagus',
      thread: 'thread-1',
      comment: 'comment-1',
      owner: 'user-1',
    };
    const mockAddedReply = new AddedReply({
      id: 'reply-1',
      content: useCasePayload.content,
      owner: 'user-1',
    });

    /** creating dependency of use case */
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.verifyAvailableThread = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyAvailableComment = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(mockAddedReply));

    /** creating use case instance */
    const getReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const addedReply = await getReplyUseCase.execute(useCasePayload);

    // Assert
    expect(addedReply).toStrictEqual(new AddedReply({
      id: 'reply-1',
      content: useCasePayload.content,
      owner: 'user-1',
    }));

    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(useCasePayload.thread);
    expect(mockCommentRepository.verifyAvailableComment).toBeCalledWith(useCasePayload.comment, useCasePayload.thread);
    expect(mockReplyRepository.addReply).toBeCalledWith(new AddReply({
        content: useCasePayload.content,
        thread: useCasePayload.thread,
        comment: useCasePayload.comment,
        owner: useCasePayload.owner,
      }),
      useCasePayload.owner, useCasePayload.thread, useCasePayload.comment);
  });
});
