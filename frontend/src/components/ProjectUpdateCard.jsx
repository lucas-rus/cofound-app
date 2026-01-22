import React, { useState } from 'react';
import { Card, Button, Form, Badge, Dropdown, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // IMPORT LINK
import ReactMarkdown from 'react-markdown';
import { FiHeart, FiMessageCircle, FiSend, FiSettings, FiEdit, FiTrash2, FiUpload, FiXCircle } from 'react-icons/fi';
import api from '../api/axiosConfig';
import Avatar from './Avatar'; // NEW IMPORT
import { useAuth } from '../context/AuthContext'; // NEW IMPORT

const ProjectUpdateCard = ({ update, onRefresh, isOwner }) => {
  const { user } = useAuth(); // NEW: Get current user for permission checks
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState(update.title);
  const [editContent, setEditContent] = useState(update.content);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImageUrl, setEditImageUrl] = useState(update.imageUrl); // New state for "See More"

  const truncateLength = 300;
  const isLongContent = update.content.length > truncateLength;
  const displayedContent = isLongContent && !showFullContent 
    ? update.content.substring(0, truncateLength) + '...' 
    : update.content;

  // Check if current user is the poster OR the project owner
  const canEdit = (user && update.poster && user.id === update.poster.id) || isOwner;

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}mo ago`;
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears}y ago`;
  };

  const handleLike = async () => {
    try {
      await api.post(`/api/projects/updates/${update.id}/like`);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await api.post(`/api/projects/updates/${update.id}/comments`, comment, {
          headers: { 'Content-Type': 'text/plain' }
      });
      setComment('');
      onRefresh();
    } catch (e) {
      alert("Failed to comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
      if (!window.confirm("Delete this comment?")) return;
      try {
          await api.delete(`/api/projects/updates/comments/${commentId}`);
          onRefresh();
      } catch (e) {
          alert("Failed to delete comment");
      }
  };

  const handleDeleteUpdate = async () => {
      if (!window.confirm("Are you sure you want to delete this update?")) return;
      try {
          await api.delete(`/api/projects/updates/${update.id}`);
          onRefresh();
      } catch (e) {
          alert(e.response?.data || "Failed to delete update");
      }
  };

  const handleOpenEditModal = () => {
      setEditTitle(update.title);
      setEditContent(update.content);
      setEditImageFile(null);
      setEditImageUrl(update.imageUrl);
      setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
      e.preventDefault();
      if (!editTitle.trim() || !editContent.trim()) {
          alert("Title and content cannot be empty.");
          return;
      }
      try {
          const formData = new FormData();
          formData.append('title', editTitle);
          formData.append('content', editContent);
          if (editImageFile) {
              formData.append('file', editImageFile);
          }
          formData.append('imageUrl', editImageUrl || '');

          await api.put(`/api/projects/updates/${update.id}`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          setShowEditModal(false);
          onRefresh();
      } catch (e) {
          alert(e.response?.data || "Failed to update post");
      }
  };

  return (
    <Card className="card-custom">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2"> {/* NEW WRAPPER */}
            <div className="d-flex align-items-center gap-2"> {/* Poster Info */}
                <Link to={`/users/${update.poster.id}`} className="d-flex align-items-center gap-2 text-decoration-none text-dark">
                    <Avatar user={update.poster} size={32} />
                    <strong className="small">{update.poster.username}</strong>
                </Link>
                <small className="text-muted">{formatRelativeTime(update.createdAt)}</small>
            </div>
            {canEdit && ( // NEW: Settings Dropdown for poster or owner
                <Dropdown align="end">
                    <Dropdown.Toggle variant="light" size="sm" id={`dropdown-update-${update.id}`}>
                        <FiSettings />
                    </Dropdown.Toggle>

                    <Dropdown.Menu style={{ minWidth: '400px' }}>
                        <Dropdown.Item onClick={handleOpenEditModal}>
                            <FiEdit className="me-2" /> Edit
                        </Dropdown.Item>
                        <Dropdown.Item onClick={handleDeleteUpdate} className="text-danger">
                            <FiTrash2 className="me-2" /> Delete
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            )}
        </div>
        
        <h5 className="fw-bold mb-2">{update.title}</h5> {/* NEW: Display title */}
        
        <div className="markdown-content">
            <ReactMarkdown>{displayedContent}</ReactMarkdown>
            {isLongContent && (
                <Button variant="link" onClick={() => setShowFullContent(!showFullContent)} className="p-0 mt-2">
                    {showFullContent ? 'See Less' : 'See More'}
                </Button>
            )}
        </div>
        
        {update.imageUrl && (
            <img src={update.imageUrl} alt="Update" className="img-fluid rounded mt-2 mb-3" style={{maxHeight: '400px'}} />
        )}

        <div className="d-flex align-items-center gap-3 mt-3 border-top pt-3">
            <Button 
                variant="link" 
                className={`p-0 text-decoration-none ${update.likedByMe ? 'text-danger' : 'text-muted'}`}
                onClick={handleLike}
            >
                <FiHeart className={`me-1 ${update.likedByMe ? 'fill-danger' : ''}`} style={{fill: update.likedByMe ? 'currentColor' : 'none'}}/> 
                {update.likeCount} Likes
            </Button>
            <Button 
                variant="link" 
                className="p-0 text-decoration-none text-muted"
                onClick={() => setShowComments(!showComments)}
            >
                <FiMessageCircle className="me-1"/> 
                {update.comments.length} Comments
            </Button>
        </div>

        {showComments && (
            <div className="mt-3 bg-light p-3 rounded">
                {update.comments.map(c => (
                    <div key={c.id} className="mb-2 position-relative group-hover">
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <Avatar user={{ username: c.username, profilePictureUrl: c.userPic }} size={24} />
                            <strong className="small">{c.username}</strong>
                            <small className="text-muted" style={{fontSize: '0.7em'}}>{formatRelativeTime(c.createdAt)}</small>
                            {user && user.id === c.userId && (
                                <FiTrash2 
                                    className="text-danger cursor-pointer ms-auto" 
                                    size={14} 
                                    style={{cursor: 'pointer'}}
                                    onClick={() => handleDeleteComment(c.id)}
                                    title="Delete comment"
                                />
                            )}
                        </div>
                        <p className="mb-0 small" style={{ marginLeft: '2rem' }}>{c.content}</p>
                    </div>
                ))}
                
                <Form onSubmit={handleComment} className="d-flex gap-2 mt-3">
                    <Form.Control 
                        size="sm" 
                        placeholder="Write a comment..." 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <Button type="submit" size="sm" variant="outline-primary"><FiSend/></Button>
                </Form>
            </div>
        )}
      </Card.Body>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Update</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control 
                type="text" 
                value={editTitle} 
                onChange={(e) => setEditTitle(e.target.value)} 
                maxLength={100}
                required 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control 
                as="textarea" rows={5} 
                value={editContent} 
                onChange={(e) => setEditContent(e.target.value)}
                maxLength={3000}
                required 
                onKeyDown={(e) => {
                    if (e.key === 'Tab') {
                        e.preventDefault();
                        const { selectionStart, selectionEnd } = e.target;
                        const value = e.target.value;
                        const spaces = '     ';
                        e.target.value = value.substring(0, selectionStart) + spaces + value.substring(selectionEnd);
                        setEditContent(e.target.value);
                        e.target.selectionStart = e.target.selectionEnd = selectionStart + spaces.length;
                    }
                }}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              {editImageUrl && (
                <div className="mb-2 position-relative d-inline-block">
                    <img src={editImageUrl} alt="Current" className="img-thumbnail" style={{maxHeight: '100px'}} />
                    <Button 
                        variant="danger" size="sm" 
                        className="position-absolute top-0 end-0 rounded-circle" 
                        onClick={() => setEditImageUrl(null)}
                        style={{transform: 'translate(50%, -50%)'}}
                    >
                        <FiXCircle />
                    </Button>
                </div>
              )}
              <Form.Control 
                type="file" 
                accept="image/*"
                onChange={(e) => setEditImageFile(e.target.files && e.target.files[0])}
              />
              <Form.Text className="text-muted">
                Leave blank to keep current image, or select new file to replace. Click X to remove current image.
              </Form.Text>
            </Form.Group>
            <Button type="submit" variant="primary">Save Changes</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Card>
  );
};

export default ProjectUpdateCard;
