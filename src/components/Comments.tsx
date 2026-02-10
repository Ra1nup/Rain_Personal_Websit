
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
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid var(--color-border, #eee);
        }
        .comments-section h3 {
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
        }
        .comment-form {
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        textarea {
          width: 100%;
          min-height: 100px;
          padding: 1rem;
          border: 1px solid var(--color-border, #ccc);
          border-radius: 8px;
          background: var(--color-bg-secondary, #fff);
          color: var(--color-text-main, #333);
          font-family: inherit;
          resize: vertical;
        }
        .reply-form textarea {
            min-height: 60px;
            margin-bottom: 0.5rem;
        }
        .submit-button {
          align-self: flex-start;
          padding: 0.75rem 1.5rem;
          background: var(--color-accent, #333);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: opacity 0.2s;
        }
        button:hover {
          opacity: 0.9;
        }
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .comment-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .comment {
          padding: 1rem;
          background: var(--color-bg-secondary, #f9f9f9);
          border-radius: 8px;
          border: 1px solid var(--color-border, #eee);
        }
        .replies-list {
            margin-top: 1rem;
            margin-left: 1.5rem;
            padding-left: 1rem;
            border-left: 2px solid var(--color-border, #eee);
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .comment-content {
          margin: 0 0 0.5rem 0;
          line-height: 1.5;
        }
        .comment-footer {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        .comment-date {
          color: var(--color-text-secondary, #888);
          font-size: 0.85rem;
        }
        .reply-button {
            background: none;
            border: none;
            color: var(--color-accent, #333);
            cursor: pointer;
            font-size: 0.85rem;
            padding: 0;
            text-decoration: underline;
        }
        .reply-actions {
            display: flex;
            gap: 0.5rem;
        }
        .cancel-button {
            padding: 0.5rem 1rem;
            background: transparent;
            border: 1px solid var(--color-border, #ccc);
            border-radius: 6px;
            cursor: pointer;
        }
        .error-message {
          color: red;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}
