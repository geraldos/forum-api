class GetDetailThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const threadId = useCasePayload.id;
    const detailThread = await this._threadRepository.getDetailThread(threadId);
    let comments = await this._commentRepository.getCommentByThreadId(threadId);

    const formattedComments = await Promise.all(
      comments.map(async ({ is_delete, ...comment }) => {
        const replies = await this._replyRepository.getReplyByThreadIdCommentId(comment.id, threadId);

        const formattedReplies = replies.map(({ is_delete, ...reply }) => ({
          ...reply,
          content: is_delete ? '**balasan telah dihapus**' : reply.content,
        }));

        return {
          ...comment,
          content: is_delete ? '**komentar telah dihapus**' : comment.content,
          replies: formattedReplies,
        };
      })
    );

    detailThread.comments = formattedComments;
    return detailThread;
  }
}

module.exports = GetDetailThreadUseCase;
