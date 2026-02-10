
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Comment {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  parent_id?: string | null;
}

interface CommentsProps {
  postId: string;
}


interface CommentItemProps {
  comment: Comment & { replies: any[] };
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  handleSubmit: (e: React.FormEvent, parentId: string | null) => void;
}

const CommentItem = ({
  comment,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  handleSubmit
}: CommentItemProps) => (
  <div className="comment">
    <div className="comment-content-wrapper">
      <p className="comment-content">{comment.content}</p>
      <div className="comment-footer">
        <small className="comment-date">
          {new Date(comment.created_at).toLocaleString()}
        </small>
        <button
          className="reply-button"
          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
        >
          Reply
        </button>
      </div>
    </div>

    {replyingTo === comment.id && (
      <form onSubmit={(e) => handleSubmit(e, comment.id)} className="reply-form">
        <textarea
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          placeholder="Write a reply..."
          required
          autoFocus
        />
        <div className="reply-actions">
          <button type="button" onClick={() => setReplyingTo(null)} className="cancel-button">
            Cancel
          </button>
          <button type="submit" className="submit-button">
            Reply
          </button>
        </div>
      </form>
    )}

    {comment.replies.length > 0 && (
      <div className="replies-list">
        {comment.replies.map(reply => (
          <CommentItem
            key={reply.id}
            comment={reply}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            handleSubmit={handleSubmit}
          />
        ))}
      </div>
    )}
  </div>
);

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  async function fetchComments() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true }); // Order by oldest first for threads

      if (error) throw error;
      setComments(data || []);
    } catch (err: any) {
      console.error('Error fetching comments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent, parentId: string | null = null) {
    e.preventDefault();
    const content = parentId ? replyContent : newComment;
    if (!content.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert([{ post_id: postId, content: content, parent_id: parentId }]);

      if (error) throw error;

      if (parentId) {
        setReplyContent('');
        setReplyingTo(null);
      } else {
        setNewComment('');
      }
      fetchComments();
    } catch (err: any) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment: ' + err.message);
    }
  }

  const buildCommentTree = (comments: Comment[]) => {
    const commentMap: { [key: string]: Comment & { replies: any[] } } = {};
    const roots: any[] = [];

    comments.forEach(comment => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    comments.forEach(comment => {
      if (comment.parent_id) {
        if (commentMap[comment.parent_id]) {
          commentMap[comment.parent_id].replies.push(commentMap[comment.id]);
        }
      } else {
        roots.push(commentMap[comment.id]);
      }
    });

    return roots.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };



  return (
    <div className="comments-section">
      <h3>Comments</h3>

      <form onSubmit={(e) => handleSubmit(e)} className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Leave a comment..."
          required
        />
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      {error && <p className="error-message">Error loading comments: {error}</p>}

      <div className="comment-list">
        {loading && <p>Loading comments...</p>}
        {!loading && comments.length === 0 && <p>No comments yet. Be the first to verify!</p>}
        {buildCommentTree(comments).map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            handleSubmit={handleSubmit}
          />
        ))}
      </div>

      <style>{`
        .comments-section {
          margin-top: 4rem;
          padding-top: 2rem;
          border-top: 1px solid var(--color-border);
        }
        .comments-section h3 {
          margin-bottom: 2rem;
          font-size: 1.75rem;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--color-text-main);
        }
        .comment-form {
          margin-bottom: 3rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        textarea {
          width: 100%;
          min-height: 120px;
          padding: 1rem;
          border: 1px solid var(--color-border);
          border-radius: 12px;
          background: var(--color-bg-secondary);
          color: var(--color-text-main);
          font-family: inherit;
          font-size: 1rem;
          line-height: 1.5;
          resize: vertical;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        textarea:focus {
          outline: none;
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.1);
        }
        .reply-form {
          margin-top: 1rem;
          margin-bottom: 1rem;
        }
        .reply-form textarea {
          min-height: 80px;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }
        .submit-button {
          align-self: flex-start;
          padding: 0.6rem 1.25rem;
          background: var(--color-accent);
          color: white;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .submit-button:hover {
          background: var(--color-accent); /* You might want a slightly darker shade or opacity change here, but standard Apple is usually just consistent or slight opacity */
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        .comment-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .comment {
          /* Clean design: no box, just content */
          padding: 0;
          background: transparent;
          border: none;
        }
        .replies-list {
          margin-top: 1.5rem;
          margin-left: 1.5rem;
          padding-left: 1.5rem;
          border-left: 2px solid var(--color-border);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .comment-content-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .comment-content {
          margin: 0;
          font-size: 1rem;
          line-height: 1.6;
          color: var(--color-text-main);
        }
        .comment-footer {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-top: 0.25rem;
        }
        .comment-date {
          color: var(--color-text-secondary);
          font-size: 0.8rem;
          font-weight: 500;
        }
        .reply-button {
          background: none;
          border: none;
          color: var(--color-accent);
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: 500;
          padding: 0;
          transition: opacity 0.2s;
        }
        .reply-button:hover {
          opacity: 0.8;
          text-decoration: underline;
        }
        .reply-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        .cancel-button {
          padding: 0.6rem 1.25rem;
          background: transparent;
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border);
          border-radius: 999px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        .cancel-button:hover {
          background: var(--color-bg-tertiary);
          color: var(--color-text-main);
        }
        .error-message {
          color: #ff3b30; /* Apple Red */
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
