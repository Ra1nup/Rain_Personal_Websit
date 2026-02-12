
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const MAX_COMMENT_LENGTH = 1000;
const COOLDOWN_MS = 30000; // 30 seconds
const MAX_DEPTH = 3;

interface Comment {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  parent_id?: string | null;
  author_name: string;
  author_website?: string;
  is_admin?: boolean;
}

interface CommentsProps {
  postId: string;
}

interface UserInputsProps {
  authorName: string;
  setAuthorName: (value: string) => void;
  authorEmail: string;
  setAuthorEmail: (value: string) => void;
  authorWebsite: string;
  setAuthorWebsite: (value: string) => void;
}

const UserInputs = ({
  authorName,
  setAuthorName,
  authorEmail,
  setAuthorEmail,
  authorWebsite,
  setAuthorWebsite
}: UserInputsProps) => (
  <div className="user-inputs">
    <div className="input-group">
      <input
        type="text"
        placeholder="Name *"
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        required
        className="user-input"
      />
    </div>
    <div className="input-group">
      <input
        type="email"
        placeholder="Email *"
        value={authorEmail}
        onChange={(e) => setAuthorEmail(e.target.value)}
        required
        className="user-input"
      />
    </div>
    <div className="input-group">
      <input
        type="url"
        placeholder="Website"
        value={authorWebsite}
        onChange={(e) => setAuthorWebsite(e.target.value)}
        className="user-input"
      />
    </div>
  </div>
);

const Toast = ({ message, isVisible, onClose }: { message: string; isVisible: boolean; onClose: () => void }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="toast-container">
      <div className="toast-content">
        {message}
      </div>
    </div>
  );
};

interface CommentItemProps {
  comment: Comment & { replies: any[] };
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyContent: string;
  setReplyContent: (content: string) => void;
  handleSubmit: (e: React.FormEvent, parentId: string | null) => void;
  // User input props for reply form
  authorName: string;
  setAuthorName: (value: string) => void;
  authorEmail: string;
  setAuthorEmail: (value: string) => void;
  authorWebsite: string;
  setAuthorWebsite: (value: string) => void;
  depth?: number;
}

const CommentItem = ({
  comment,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  handleSubmit,
  authorName,
  setAuthorName,
  authorEmail,
  setAuthorEmail,
  authorWebsite,
  setAuthorWebsite,
  depth = 0
}: CommentItemProps) => {

  // Helper to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`comment ${comment.is_admin ? 'admin-comment' : ''}`}>
      <div className="comment-content-wrapper">
        <div className="comment-header">
          {comment.author_website ? (
            <a href={comment.author_website} target="_blank" rel="noopener noreferrer" className="comment-author">
              {comment.author_name}
            </a>
          ) : (
            <span className="comment-author">{comment.author_name}</span>
          )}
          {comment.is_admin && <span className="admin-badge">Admin</span>}
          <span className="comment-date">{formatDate(comment.created_at)}</span>
        </div>

        <p className="comment-text">{comment.content}</p>

          <div className="comment-actions">
            {depth < MAX_DEPTH && (
              <button
                className="reply-button"
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              >
                Reply
              </button>
            )}
          </div>
      </div>

      {replyingTo === comment.id && (
        <form onSubmit={(e) => handleSubmit(e, comment.id)} className="reply-form" noValidate>
          <UserInputs
            authorName={authorName}
            setAuthorName={setAuthorName}
            authorEmail={authorEmail}
            setAuthorEmail={setAuthorEmail}
            authorWebsite={authorWebsite}
            setAuthorWebsite={setAuthorWebsite}
          />
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            required
            autoFocus
            className="reply-textarea"
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
              authorName={authorName}
              setAuthorName={setAuthorName}
              authorEmail={authorEmail}
              setAuthorEmail={setAuthorEmail}
              authorWebsite={authorWebsite}
              setAuthorWebsite={setAuthorWebsite}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User details state
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [authorWebsite, setAuthorWebsite] = useState('');
  const [saveInfo, setSaveInfo] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const showNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };


  useEffect(() => {
    fetchComments();

    // Load saved user info
    const savedName = localStorage.getItem('comment_author_name');
    const savedEmail = localStorage.getItem('comment_author_email');
    const savedWebsite = localStorage.getItem('comment_author_website');
    const savedSaveInfo = localStorage.getItem('comment_save_info');

    if (savedSaveInfo === 'true') {
      setSaveInfo(true);
      if (savedName) setAuthorName(savedName);
      if (savedEmail) setAuthorEmail(savedEmail);
      if (savedWebsite) setAuthorWebsite(savedWebsite);
    }
  }, [postId]);

  async function fetchComments() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

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

    if (!content.trim()) {
      showNotification('Please enter a comment');
      return;
    }

    if (content.length > MAX_COMMENT_LENGTH) {
      showNotification(`Comment is too long. Maximum ${MAX_COMMENT_LENGTH} characters allowed.`);
      return;
    }

    const lastCommentTime = localStorage.getItem('last_comment_time');
    if (lastCommentTime && Date.now() - parseInt(lastCommentTime) < COOLDOWN_MS) {
      const remainingSeconds = Math.ceil((COOLDOWN_MS - (Date.now() - parseInt(lastCommentTime))) / 1000);
      showNotification(`Please wait ${remainingSeconds} seconds before posting another comment.`);
      return;
    }

    if (!authorName.trim()) {
      showNotification('Please enter your name');
      return;
    }
    if (!authorEmail.trim()) {
      showNotification('Please enter your email');
      return;
    }

    // Save info if checked
    if (saveInfo) {
      localStorage.setItem('comment_author_name', authorName);
      localStorage.setItem('comment_author_email', authorEmail);
      localStorage.setItem('comment_author_website', authorWebsite);
      localStorage.setItem('comment_save_info', 'true');
    } else {
      localStorage.removeItem('comment_author_name');
      localStorage.removeItem('comment_author_email');
      localStorage.removeItem('comment_author_website');
      localStorage.setItem('comment_save_info', 'false');
    }

    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          post_id: postId,
          content: content,
          parent_id: parentId,
          author_name: authorName,
          author_email: authorEmail,
          author_website: authorWebsite,
          is_admin: authorEmail === 'kq69513516@proton.me'        }]);

      if (error) throw error;

      if (parentId) {
        setReplyContent('');
        setReplyingTo(null);
      } else {
        setNewComment('');
      }
      localStorage.setItem('last_comment_time', Date.now().toString());
      fetchComments();
    } catch (err: any) {
      console.error('Error adding comment:', err);
      showNotification('Failed to add comment: ' + err.message);
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
      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
      <h3>{comments.length} Comments</h3>

      <div className="new-comment-section">
        <h4 className="section-title">Leave a Comment</h4>
        <p className="section-subtitle">Your email address will not be published. Required fields are marked *</p>

        <form onSubmit={(e) => handleSubmit(e)} className="comment-form" noValidate>
          <UserInputs
            authorName={authorName}
            setAuthorName={setAuthorName}
            authorEmail={authorEmail}
            setAuthorEmail={setAuthorEmail}
            authorWebsite={authorWebsite}
            setAuthorWebsite={setAuthorWebsite}
          />



          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment... *"
            required
            className="main-textarea"
          />

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={saveInfo}
                onChange={(e) => setSaveInfo(e.target.checked)}
              />
              Save my name, email, and website in this browser for the next time I comment.
            </label>
          </div>

          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      </div>

      <div className="comment-list">
        {loading && <p>Loading comments...</p>}
        {!loading && comments.length === 0 && <p>No comments yet.</p>}
        {buildCommentTree(comments).map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            handleSubmit={handleSubmit}
            authorName={authorName}
            setAuthorName={setAuthorName}
            authorEmail={authorEmail}
            setAuthorEmail={setAuthorEmail}
            authorWebsite={authorWebsite}
            setAuthorWebsite={setAuthorWebsite}
            depth={0}
          />
        ))}
      </div>

      <style>{`
        .comments-section {
          margin-top: 4rem;
          padding-top: 2rem;
          border-top: 1px solid var(--color-border);
        }
        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--color-text-main);
        }
        .section-subtitle {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          margin-bottom: 1.5rem;
        }
        .user-inputs {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .user-input {
          width: 100%;
          padding: 0.8rem 1rem;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          background: var(--color-bg-secondary);
          color: var(--color-text-main);
          font-size: 16px;
          transition: border-color 0.2s;
        }
        .user-input:focus {
          outline: none;
          border-color: var(--color-accent);
        }
        .main-textarea {
          width: 100%;
          min-height: 150px;
          padding: 1rem;
          border: 1px solid var(--color-border);
          border-radius: 12px;
          background: var(--color-bg-secondary);
          color: var(--color-text-main);
          font-family: inherit;
          font-size: 16px;
          resize: vertical;
          margin-bottom: 1rem;
        }
        .main-textarea:focus {
          outline: none;
          border-color: var(--color-accent);
        }
        .checkbox-group {
          margin-bottom: 1rem;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          cursor: pointer;
        }
        .submit-button {
          padding: 0.8rem 1.5rem;
          background: var(--color-accent);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .submit-button:hover {
          opacity: 0.9;
        }
        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Comment List */
        .comment-list {
          margin-top: 3rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .comment-content-wrapper {
          padding-bottom: 1rem;
        }
        .comment-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }
        .comment-author {
          font-weight: 600;
          color: var(--color-text-main);
          text-decoration: none;
        }
        .comment-author:hover {
          text-decoration: underline;
        }
        .admin-badge {
          background: var(--color-accent);
          color: white;
          font-size: 0.7rem;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          font-weight: 600;
        }
        .comment-date {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
        }
        .comment-text {
          margin-bottom: 0.5rem;
          line-height: 1.6;
          color: var(--color-text-main);
        }
        .reply-button {
          background: none;
          border: none;
          color: var(--color-text-secondary);
          cursor: pointer;
          font-size: 0.85rem;
          padding: 0;
          text-decoration: underline;
        }
        .reply-button:hover {
          color: var(--color-accent);
        }
        .replies-list {
          margin-left: 1.5rem;
          padding-left: 1.5rem;
          border-left: 2px solid var(--color-border);
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Inline Reply Form */
        .reply-form {
          margin-top: 1rem;
          margin-bottom: 2rem;
          background: var(--color-bg-secondary);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid var(--color-border);
        }
        .reply-textarea {
          width: 100%;
          min-height: 100px;
          padding: 1rem;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          margin-bottom: 1rem;
          background: var(--color-bg-primary);
          color: var(--color-text-main);
          font-size: 16px;
        }
        .reply-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }
        .cancel-button {
          padding: 0.6rem 1.2rem;
          background: transparent;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          color: var(--color-text-secondary);
          cursor: pointer;
        }
        .cancel-button:hover {
          background: var(--color-bg-tertiary);
          color: var(--color-text-main);
        }

        /* Toast Notification */
        .toast-container {
          position: fixed;
          top: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          pointer-events: none;
        }
        .toast-content {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          padding: 12px 24px;
          border-radius: 24px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          font-size: 0.95rem;
          font-weight: 500;
          color: #333;
          animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Dark mode adjustment if applicable (assuming user has specific variables or class) */
        @media (prefers-color-scheme: dark) {
          .toast-content {
            background: rgba(30, 30, 30, 0.85);
            color: #fff;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
        }
      `}</style>
    </div>
  );
}


